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
    ]

    @objc func startGoalAR(_ call: CAPPluginCall) {
        let modelName  = call.getString("model")     ?? "toy_car"
        let progress   = call.getFloat("progress")   ?? 0.0
        let goalID     = call.getString("goalID")    ?? "default"
        let modelSize  = call.getFloat("modelSize")  ?? 0.5  // ← added

        let status = AVCaptureDevice.authorizationStatus(for: .video)

        switch status {
        case .authorized:
            self.presentAR(modelName: modelName, progress: progress,
                           goalID: goalID, modelSize: modelSize, call: call)

        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                if granted {
                    self.presentAR(modelName: modelName, progress: progress,
                                   goalID: goalID, modelSize: modelSize, call: call)
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

    private func presentAR(modelName: String, progress: Float,
                            goalID: String, modelSize: Float,  // ← added modelSize
                            call: CAPPluginCall) {
        DispatchQueue.main.async {
            let vc        = GoalARViewController()
            vc.modelName  = modelName
            vc.progress   = progress
            vc.goalID     = goalID
            vc.modelSize  = modelSize  // ← added
            vc.onDone = { anchorID in
                call.resolve(["anchorID": anchorID])
            }
            self.bridge?.viewController?.present(vc, animated: true)
        }
    }
}
