import React from "react";
import { IonPage, IonContent, IonButton, IonIcon } from "@ionic/react";
import { logIn, personAdd } from "ionicons/icons";
import "./Auth.css";

interface AuthChoiceProps {
    onLogin: () => void;
    onRegister: () => void;
}

const AuthChoice: React.FC<AuthChoiceProps> = ({ onLogin, onRegister }) => {
    return (
        <IonPage>
            <IonContent fullscreen className='auth-choice-content'>
                <div className='auth-choice-container'>
                    <div className='auth-logo'>💰</div>
                    <h1>Aura Finance</h1>
                    <p className='auth-subtitle'>
                        Smart budgeting with AR visualization
                    </p>

                    <div className='auth-buttons'>
                        <IonButton
                            expand='block'
                            onClick={onLogin}
                            className='login-button'
                        >
                            <IonIcon slot='start' icon={logIn} />
                            Login
                        </IonButton>

                        <IonButton
                            expand='block'
                            onClick={onRegister}
                            fill='outline'
                            className='register-button'
                        >
                            <IonIcon slot='start' icon={personAdd} />
                            Create Account
                        </IonButton>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default AuthChoice;
