import RealityKit
import ARKit
import UIKit

class GoalARRenderer {

    private weak var arView: ARView?
    private var modelEntity: ModelEntity?

    init(arView: ARView) {
        self.arView = arView
    }

    // MARK: - Place (fresh placement)

    func placeModel(name: String, progress: Float, size: Float = 0.5, transform: simd_float4x4) -> AnchorEntity {
        let anchor = AnchorEntity(world: transform)
        attachModel(name: name, progress: progress, size: size, to: anchor)
        arView?.scene.addAnchor(anchor)
        return anchor
    }

    // MARK: - Attach (used for both fresh placement and restoration)

    func attachModel(name: String, progress: Float, size: Float, to anchor: AnchorEntity) {
        print("Loading model: \(name).usdz")

        do {
            let model = try ModelEntity.loadModel(named: name)
            print("Model loaded: \(name)")

            scaleModelToFit(model: model, desiredSize: size)
            applyProgress(to: model, progress: progress)
            anchor.addChild(model)
            self.modelEntity = model

        } catch {
            print("Failed to load model '\(name)': \(error)")

            var material   = SimpleMaterial()
            material.color = .init(tint: .red)
            let fallback   = ModelEntity(
                mesh:      .generateBox(size: size * 0.5),
                materials: [material]
            )
            anchor.addChild(fallback)
            self.modelEntity = fallback
        }
    }

    // MARK: - Scale

    private func scaleModelToFit(model: ModelEntity, desiredSize: Float) {
        let bounds = model.visualBounds(relativeTo: nil)
        let width  = bounds.extents.x
        let height = bounds.extents.y
        let depth  = bounds.extents.z
        let maxDim = max(width, max(height, depth))

        guard maxDim > 0 else { return }

        let scale = desiredSize / maxDim
        model.scale = SIMD3<Float>(repeating: scale)

        print("Model dimensions: \(width)w x \(height)h x \(depth)d")
        print("Scale applied: \(scale) to fit \(desiredSize)m")
    }

    // MARK: - Progress

    func updateProgress(_ progress: Float) {
        guard let model = modelEntity else { return }
        applyProgress(to: model, progress: progress)
        if progress >= 1.0 { triggerGold(model) }
    }

    private func applyProgress(to model: ModelEntity, progress: Float) {
        var mat = PhysicallyBasedMaterial()

        switch progress {
        case 0..<0.30:
            mat.baseColor = .init(tint: .white)
            mat.blending  = .transparent(opacity: .init(floatLiteral: 0.12))

        case 0.30..<0.70:
            let opacity   = Float(0.3 + (progress - 0.3) * 0.8)
            mat.baseColor = .init(tint: UIColor(red: 0.36, green: 0.64, blue: 0.98, alpha: 1))
            mat.blending  = .transparent(opacity: .init(floatLiteral: opacity))

        case 0.70..<1.0:
            mat.baseColor = .init(tint: UIColor(red: 0.23, green: 0.51, blue: 0.97, alpha: 1))
            mat.blending  = .opaque
            mat.roughness = .init(floatLiteral: 0.4)
            mat.metallic  = .init(floatLiteral: 0.3)

        default:
            mat.baseColor = .init(tint: UIColor(red: 0.23, green: 0.51, blue: 0.97, alpha: 1))
            mat.blending  = .opaque
        }

        let count = model.model?.materials.count ?? 1
        model.model?.materials = Array(repeating: mat, count: count)
    }

    // MARK: - Gold celebration

    private func triggerGold(_ model: ModelEntity) {
        var gold       = PhysicallyBasedMaterial()
        gold.baseColor = .init(tint: UIColor(red: 0.96, green: 0.62, blue: 0.04, alpha: 1))
        gold.metallic  = .init(floatLiteral: 1.0)
        gold.roughness = .init(floatLiteral: 0.05)
        gold.blending  = .opaque

        let count = model.model?.materials.count ?? 1
        model.model?.materials = Array(repeating: gold, count: count)

        let spin = Transform(
            scale:       model.transform.scale,
            rotation:    simd_quatf(angle: .pi * 2, axis: [0, 1, 0]),
            translation: model.transform.translation
        )
        model.move(to: spin, relativeTo: model.parent,
                   duration: 2.5, timingFunction: .easeInOut)
    }
}
