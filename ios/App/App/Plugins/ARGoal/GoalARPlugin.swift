import Capacitor
import AVFoundation

@objc(GoalARPlugin)
public class GoalARPlugin: CAPPlugin, CAPBridgedPlugin {

    public let identifier = "GoalARPlugin"
    public let jsName = "GoalARPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "startGoalAR",    returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "updateProgress", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "resetAnchor",    returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "measureLatency", returnType: CAPPluginReturnPromise),
    ]

    @objc func startGoalAR(_ call: CAPPluginCall) {
        let modelName  = call.getString("model")     ?? "toy_car"
        let progress   = call.getFloat("progress")   ?? 0.0
        let goalID     = call.getString("goalID")    ?? "default"
        let anchorID   = call.getString("anchorID")
        let modelSize  = call.getFloat("modelSize")  ?? 0.18

        let status = AVCaptureDevice.authorizationStatus(for: .video)

        switch status {
        case .authorized:
            self.presentAR(modelName: modelName, progress: progress,
                           goalID: goalID, anchorID: anchorID,
                           modelSize: modelSize, call: call)

        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                if granted {
                    self.presentAR(modelName: modelName, progress: progress,
                                   goalID: goalID, anchorID: anchorID,
                                   modelSize: modelSize, call: call)
                } else {
                    call.reject("Camera access denied")
                }
            }

        case .denied, .restricted:
            call.reject("Camera access denied. Please enable in Settings.")
            DispatchQueue.main.async {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            }

        @unknown default:
            call.reject("Unknown camera permission state")
        }
    }

    @objc func updateProgress(_ call: CAPPluginCall) {
        let progress = call.getFloat("progress") ?? 0.0
        DispatchQueue.main.async {
            GoalARViewController.current?.updateProgress(progress)
            call.resolve()
        }
    }

    @objc func resetAnchor(_ call: CAPPluginCall) {
        let goalID = call.getString("goalID") ?? "default"
        let docs   = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let url    = docs.appendingPathComponent("worldmap_\(goalID).arexperience")
        try? FileManager.default.removeItem(at: url)
        call.resolve()
    }

    @objc func measureLatency(_ call: CAPPluginCall) {
        let sentAt = call.getDouble("sentAt") ?? 0.0
        let sequence = call.getInt("sequence") ?? 0
        let payload = call.getString("payload") ?? "{}"
        let receivedAt = Date().timeIntervalSince1970 * 1000.0

        let payloadBytes = payload.utf8.count
        let parsedKeys: Int

        if let data = payload.data(using: .utf8),
           let object = try? JSONSerialization.jsonObject(with: data),
           let dictionary = object as? [String: Any] {
            parsedKeys = dictionary.count
        } else {
            parsedKeys = 0
        }

        let processedAt = Date().timeIntervalSince1970 * 1000.0

        call.resolve([
            "sequence": sequence,
            "sentAt": sentAt,
            "receivedAt": receivedAt,
            "processedAt": processedAt,
            "payloadBytes": payloadBytes,
            "parsedKeys": parsedKeys,
        ])
    }

    private func presentAR(modelName: String, progress: Float,
                            goalID: String, anchorID: String?, modelSize: Float,  // ← added modelSize
                            call: CAPPluginCall) {
        DispatchQueue.main.async {
            let vc        = GoalARViewController()
            vc.modelName  = modelName
            vc.progress   = progress
            vc.goalID     = goalID
            vc.anchorID   = anchorID
            vc.modelSize  = modelSize  // ← added
            vc.onDone = { anchorID in
                call.resolve(["anchorID": anchorID])
            }
            self.bridge?.viewController?.present(vc, animated: true)
        }
    }
}
