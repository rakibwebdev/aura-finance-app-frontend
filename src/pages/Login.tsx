import React, { useState } from "react";
import {
    IonPage,
    IonContent,
    IonButton,
    IonIcon,
    IonLoading,
} from "@ionic/react";
import { logIn } from "ionicons/icons";
import { useAuth } from "../contexts/AuthContext";
import FormInput from "../components/FormInput";
import PageHeader from "../components/PageHeader";
import "./Auth.css";
import axios from "axios";

interface LoginProps {
    onSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);

        try {
            setLoading(true);
            setError("");

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/users/login`,
                {
                    email,
                    password,
                },
            );

            const userData = response.data;

            // Login successful
            login({
                id: userData._id,
                email: userData.email,
                name: userData.name,
            });

            onSuccess();
        } catch (err) {
            let errorMessage = "Login failed. Please try again.";

            if (axios.isAxiosError(err)) {
                errorMessage =
                    err.response?.data?.error ||
                    err.response?.statusText ||
                    errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailChange = (e: CustomEvent) => {
        setEmail(e.detail.value!);
    };

    const handlePasswordChange = (e: CustomEvent) => {
        setPassword(e.detail.value!);
    };

    return (
        <IonPage>
            <PageHeader title='Login' backHref='/auth' showLogout={false} />
            <IonContent fullscreen className='auth-content'>
                <div className='auth-form-container'>
                    <div className='auth-logo-small'>💰</div>
                    <h2>Welcome Back</h2>
                    <p className='auth-description'>
                        Sign in to continue managing your budget
                    </p>

                    <form onSubmit={handleLogin}>
                        <FormInput
                            label='Email'
                            type='email'
                            value={email}
                            onIonInput={handleEmailChange}
                            placeholder='Enter your email'
                            required
                        />

                        <FormInput
                            label='Password'
                            type='password'
                            value={password}
                            onIonInput={handlePasswordChange}
                            placeholder='Enter your password'
                            required
                        />

                        {error && <div className='auth-error'>{error}</div>}

                        <IonButton
                            expand='block'
                            type='submit'
                            className='auth-submit-button'
                            disabled={loading}
                        >
                            <IonIcon slot='start' icon={logIn} />
                            {loading ? "Logging in..." : "Login"}
                        </IonButton>
                    </form>
                </div>

                <IonLoading isOpen={loading} message='Logging in...' />
            </IonContent>
        </IonPage>
    );
};

export default Login;
