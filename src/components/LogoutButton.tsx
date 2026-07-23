import React from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { logOut } from "ionicons/icons";
import { useAuth } from "../contexts/AuthContext";

const LogoutButton: React.FC = () => {
    const { logout } = useAuth();

    return (
        <IonButton fill='clear' color='light' onClick={logout}>
            <IonIcon slot='start' icon={logOut} />
        </IonButton>
    );
};

export default LogoutButton;
