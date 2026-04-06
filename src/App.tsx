import { Redirect, Route } from "react-router-dom";
import {
    IonApp,
    IonRouterOutlet,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { home, scan, trophy, wallet } from "ionicons/icons";
import { BudgetProvider } from "./contexts/BudgetContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Scanner from "./pages/Scanner";
import Goals from "./pages/Goals";
import Budget from "./pages/Budget";
import Onboarding from "./pages/Onboarding";
import AuthChoice from "./pages/AuthChoice";
import Login from "./pages/Login";
import Register from "./pages/Register";


/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";

setupIonicReact();

const AppContent: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
        return localStorage.getItem("hasSeenOnboarding") === "true";
    });
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    const handleOnboardingComplete = () => {
        localStorage.setItem("hasSeenOnboarding", "true");
        setHasSeenOnboarding(true);
    };

    const handleLoginSuccess = () => {
        setShowLogin(false);
        setShowRegister(false);
    };

    const handleRegisterSuccess = () => {
        setShowLogin(false);
        setShowRegister(false);
    };

    if (!hasSeenOnboarding) {
        return <Onboarding onComplete={handleOnboardingComplete} />;
    }

    if (!isAuthenticated) {
        if (showLogin) {
            return <Login onSuccess={handleLoginSuccess} />;
        }
        if (showRegister) {
            return <Register onSuccess={handleRegisterSuccess} />;
        }
        return (
            <AuthChoice
                onLogin={() => setShowLogin(true)}
                onRegister={() => setShowRegister(true)}
            />
        );
    }

    return (
        <IonReactRouter>
            <IonTabs>
                <IonRouterOutlet>
                    <Route exact path='/dashboard'>
                        <Dashboard />
                    </Route>
                    <Route exact path='/budget'>
                        <Budget />
                    </Route>
                    <Route exact path='/scanner'>
                        <Scanner />
                    </Route>
                    <Route exact path='/goals'>
                        <Goals />
                    </Route>
                    <Route exact path='/'>
                        <Redirect to='/dashboard' />
                    </Route>
                </IonRouterOutlet>
                <IonTabBar slot='bottom'>
                    <IonTabButton tab='dashboard' href='/dashboard'>
                        <IonIcon icon={home} />
                        <IonLabel>Dashboard</IonLabel>
                    </IonTabButton>
                    <IonTabButton tab='budget' href='/budget'>
                        <IonIcon icon={wallet} />
                        <IonLabel>Budget</IonLabel>
                    </IonTabButton>
                    <IonTabButton tab='scanner' href='/scanner'>
                        <IonIcon icon={scan} />
                        <IonLabel>Scan</IonLabel>
                    </IonTabButton>
                    <IonTabButton tab='goals' href='/goals'>
                        <IonIcon icon={trophy} />
                        <IonLabel>Goals</IonLabel>
                    </IonTabButton>
                </IonTabBar>
            </IonTabs>
        </IonReactRouter>
    );
};

const App: React.FC = () => (
    <IonApp>
        <AuthProvider>
            <BudgetProvider>
                <AppContent />
            </BudgetProvider>
        </AuthProvider>
    </IonApp>
);

export default App;
