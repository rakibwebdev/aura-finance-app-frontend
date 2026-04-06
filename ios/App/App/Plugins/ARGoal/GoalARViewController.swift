import UIKit
import ARKit
import RealityKit

class GoalARViewController: UIViewController, ARSessionDelegate {

    static weak var current: GoalARViewController?

    var modelName: String = "toy_car"
    var progress: Float   = 0.0
    var goalID: String    = ""
    var modelSize: Float  = 0.5
    var onDone: ((String) -> Void)?

    private var arView:             ARView!
    private var renderer:           GoalARRenderer!
    private var hasPlacedModel      = false
    private var isRestoringFromSave = false
    private var statusLabel:        UILabel?

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        GoalARViewController.current = self

        arView = ARView(frame: view.bounds)
        arView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(arView)

        renderer = GoalARRenderer(arView: arView)
        arView.session.delegate = self

        setupUI()

        if let worldMap = loadWorldMap(for: goalID) {
            print("✅ Saved world map found — attempting to restore")
            isRestoringFromSave = true
            updateStatusLabel("Point camera at where you placed the goal...")
            startSession(with: worldMap)
        } else {
            print("📍 No saved map — fresh placement mode")
            updateStatusLabel("Move phone slowly to scan floor, then tap")
            startSession(with: nil)
        }
    }

    // MARK: - AR Session

    private func startSession(with worldMap: ARWorldMap?) {
        let config = ARWorldTrackingConfiguration()
        config.planeDetection       = [.horizontal, .vertical]
        config.environmentTexturing = .automatic

        if let map = worldMap {
            config.initialWorldMap = map
            arView.session.run(config)
        } else {
            arView.session.run(config, options: [.resetTracking, .removeExistingAnchors])
        }
    }

    // MARK: - ARSessionDelegate

    func session(_ session: ARSession, didUpdate frame: ARFrame) {
        switch frame.worldMappingStatus {
        case .mapped where isRestoringFromSave && !hasPlacedModel:
            DispatchQueue.main.async {
                self.restoreModelFromSavedAnchor()
            }

        case .extending, .mapped:
            if !isRestoringFromSave && !hasPlacedModel {
                updateStatusLabel("Tracking active — tap to place")
            } else if hasPlacedModel {
                updateStatusLabel("Tracking active")
            }

        case .limited:
            if isRestoringFromSave {
                updateStatusLabel("Point camera at where you placed the goal...")
            } else if !hasPlacedModel {
                updateStatusLabel("Move around to improve tracking")
            }

        case .notAvailable:
            updateStatusLabel("Tracking unavailable")

        @unknown default:
            break
        }
    }

    func session(_ session: ARSession, didAdd anchors: [ARAnchor]) {
        let hasPlane = anchors.contains { $0 is ARPlaneAnchor }
        if hasPlane && !hasPlacedModel && !isRestoringFromSave {
            updateStatusLabel("Surface found — tap to place your goal")
        }
    }

    // MARK: - Restore saved model

    private func restoreModelFromSavedAnchor() {
        guard !hasPlacedModel else { return }
        guard let frame = arView.session.currentFrame else { return }

        // Find the model anchor — any anchor that is not a plane
        let modelAnchor = frame.anchors.first { !($0 is ARPlaneAnchor) }

        if let anchor = modelAnchor {
            print("✅ Anchor found — restoring model at saved position")
            let anchorEntity = AnchorEntity(anchor: anchor)
            renderer.attachModel(
                name:     modelName,
                progress: progress,
                size:     modelSize,
                to:       anchorEntity
            )
            arView.scene.addAnchor(anchorEntity)
            hasPlacedModel      = true
            isRestoringFromSave = false
            updateStatusLabel("Goal restored!")
            onDone?(anchor.identifier.uuidString)
        } else {
            print("⚠️ No saved anchor found — falling back to fresh placement")
            isRestoringFromSave = false
            updateStatusLabel("Could not restore — tap to place again")
        }
    }

    // MARK: - Tap to place

    @objc func onTap(_ sender: UITapGestureRecognizer) {
        guard !hasPlacedModel else { return }

        let point = sender.location(in: arView)

        var results = arView.raycast(
            from:      point,
            allowing:  .estimatedPlane,
            alignment: .horizontal
        )

        if results.isEmpty {
            results = arView.raycast(
                from:      point,
                allowing:  .existingPlaneGeometry,
                alignment: .any
            )
        }

        if results.isEmpty {
            updateStatusLabel("No surface detected — placing in front of camera")
            placeModelInFrontOfCamera()
            return
        }

        guard let hit = results.first else { return }

        updateStatusLabel("Placing...")
        placeAndSave(transform: hit.worldTransform)
    }

    private func placeModelInFrontOfCamera() {
        guard let cameraTransform = arView.session.currentFrame?.camera.transform else {
            updateStatusLabel("Camera not ready — try again")
            return
        }
        var translation = matrix_identity_float4x4
        translation.columns.3.z = -1.5
        let transform = simd_mul(cameraTransform, translation)
        placeAndSave(transform: transform)
    }

    private func placeAndSave(transform: simd_float4x4) {
        let anchor       = ARAnchor(transform: transform)
        let anchorEntity = AnchorEntity(anchor: anchor)

        arView.session.add(anchor: anchor)

        renderer.attachModel(
            name:     modelName,
            progress: progress,
            size:     modelSize,
            to:       anchorEntity
        )
        arView.scene.addAnchor(anchorEntity)

        hasPlacedModel = true
        updateStatusLabel("Saving...")

        saveWorldMap(for: goalID) {
            self.updateStatusLabel("Goal placed and saved!")
            self.onDone?(anchor.identifier.uuidString)
        }
    }

    // MARK: - Progress update

    func updateProgress(_ value: Float) {
        renderer.updateProgress(value)
    }

    // MARK: - World Map persistence

    private func worldMapURL(for goalID: String) -> URL {
        let docs = FileManager.default.urls(
            for: .documentDirectory,
            in:  .userDomainMask
        )[0]
        return docs.appendingPathComponent("worldmap_\(goalID).arexperience")
    }

    private func saveWorldMap(for goalID: String, completion: @escaping () -> Void) {
        arView.session.getCurrentWorldMap { worldMap, error in
            guard let map = worldMap else {
                print("⚠️ Could not get world map: \(error?.localizedDescription ?? "unknown")")
                completion()
                return
            }
            do {
                let data = try NSKeyedArchiver.archivedData(
                    withRootObject: map,
                    requiringSecureCoding: true
                )
                try data.write(to: self.worldMapURL(for: goalID), options: [.atomic])
                print("✅ World map saved for goal: \(goalID)")
            } catch {
                print("❌ Failed to save world map: \(error)")
            }
            completion()
        }
    }

    private func loadWorldMap(for goalID: String) -> ARWorldMap? {
        let url = worldMapURL(for: goalID)
        guard FileManager.default.fileExists(atPath: url.path) else {
            return nil
        }
        do {
            let data = try Data(contentsOf: url)
            let map  = try NSKeyedUnarchiver.unarchivedObject(
                ofClass: ARWorldMap.self,
                from:    data
            )
            print("✅ World map loaded for goal: \(goalID)")
            return map
        } catch {
            print("❌ Failed to load world map: \(error)")
            return nil
        }
    }

    // MARK: - UI

    private func setupUI() {
        let status            = UILabel()
        status.text           = "Initialising AR..."
        status.textColor      = .white
        status.font           = .systemFont(ofSize: 14, weight: .medium)
        status.textAlignment  = .center
        status.backgroundColor = UIColor.black.withAlphaComponent(0.55)
        status.layer.cornerRadius = 10
        status.clipsToBounds  = true
        status.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(status)
        self.statusLabel = status

        let closeBtn = UIButton(type: .system)
        closeBtn.setTitle("Done", for: .normal)
        closeBtn.setTitleColor(.white, for: .normal)
        closeBtn.titleLabel?.font   = .systemFont(ofSize: 15, weight: .semibold)
        closeBtn.backgroundColor    = UIColor.black.withAlphaComponent(0.55)
        closeBtn.layer.cornerRadius = 16
        closeBtn.translatesAutoresizingMaskIntoConstraints = false
        closeBtn.addTarget(self, action: #selector(close), for: .touchUpInside)
        view.addSubview(closeBtn)

        let tap = UITapGestureRecognizer(target: self, action: #selector(onTap))
        arView.addGestureRecognizer(tap)

        NSLayoutConstraint.activate([
            status.bottomAnchor.constraint(
                equalTo:  view.safeAreaLayoutGuide.bottomAnchor,
                constant: -80),
            status.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            status.widthAnchor.constraint(equalToConstant: 300),
            status.heightAnchor.constraint(equalToConstant: 40),

            closeBtn.topAnchor.constraint(
                equalTo:  view.safeAreaLayoutGuide.topAnchor,
                constant: 16),
            closeBtn.trailingAnchor.constraint(
                equalTo:  view.trailingAnchor,
                constant: -16),
            closeBtn.widthAnchor.constraint(equalToConstant: 80),
            closeBtn.heightAnchor.constraint(equalToConstant: 32),
        ])
    }

    func updateStatusLabel(_ text: String) {
        DispatchQueue.main.async {
            self.statusLabel?.text = text
        }
    }

    @objc func close() {
        dismiss(animated: true)
    }
}
