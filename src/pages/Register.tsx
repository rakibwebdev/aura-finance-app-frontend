import React, { useState } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonLoading,
} from "@ionic/react";
import { personAdd } from "ionicons/icons";
import { useAuth } from "../contexts/AuthContext";
import FormInput from "../components/FormInput";
import "./Auth.css";
import axios from "axios";

interface RegisterProps {
    onSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSuccess }) => {
    const { login } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async () => {
        setError("");
        console.log(name, email, password, confirmPassword);

        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/users`,
                {
                    email,
                    password,
                    name,
                    weeklyBudget: 0,
                },
            );

            const userData = response.data;

            login({
                id: userData._id,
                email: userData.email,
                name: userData.name,
            });

            onSuccess();
        } catch (err) {
            let errorMessage = "Registration failed. Please try again.";

            if (axios.isAxiosError(err)) {
                errorMessage =
                    err.response?.data?.error || err.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color='primary'>
                    <IonButtons slot='start'>
                        <IonBackButton defaultHref='/auth' />
                    </IonButtons>
                    <IonTitle>Create Account</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className='auth-content'>
                <div className='auth-form-container'>
                    <div className='auth-logo-small'>💰</div>
                    <h2>Get Started</h2>
                    <p className='auth-description'>
                        Create your account to start managing your finances
                    </p>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleRegister();
                        }}
                    >
                        <FormInput
                            label='Name'
                            type='text'
                            value={name}
                            onIonInput={(e) => setName(e.detail.value!)}
                            placeholder='Enter your name'
                            required
                        />

                        <FormInput
                            label='Email'
                            type='email'
                            value={email}
                            onIonInput={(e) => setEmail(e.detail.value!)}
                            placeholder='Enter your email'
                            required
                        />

                        <FormInput
                            label='Password'
                            type='password'
                            value={password}
                            onIonInput={(e) => setPassword(e.detail.value!)}
                            placeholder='Enter your password'
                            required
                        />

                        <FormInput
                            label='Confirm Password'
                            type='password'
                            value={confirmPassword}
                            onIonInput={(e) =>
                                setConfirmPassword(e.detail.value!)
                            }
                            placeholder='Confirm your password'
                            required
                        />

                        {error && <div className='auth-error'>{error}</div>}

                        <IonButton
                            expand='block'
                            type='submit'
                            className='auth-submit-button'
                            disabled={loading}
                        >
                            <IonIcon slot='start' icon={personAdd} />
                            {loading ? "Creating Account..." : "Create Account"}
                        </IonButton>
                    </form>
                </div>

                <IonLoading isOpen={loading} message='Creating account...' />
            </IonContent>
        </IonPage>
    );
};

export default Register;
