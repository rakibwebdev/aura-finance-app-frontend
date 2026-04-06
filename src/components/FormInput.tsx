import React from "react";
import { IonInput, IonInputPasswordToggle } from "@ionic/react";
import { InputChangeEventDetail } from "@ionic/react";

interface FormInputProps {
    label: string;
    type?: "text" | "email" | "password" | "number" | "tel";
    value: string;
    onIonInput: (e: CustomEvent<InputChangeEventDetail>) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
}

const FormInput: React.FC<FormInputProps> = ({
    label,
    type = "text",
    value,
    onIonInput,
    placeholder,
    required = false,
    className = "",
}) => {
    return type === "password" ? (
        <IonInput
            type={type}
            value={value}
            onIonInput={onIonInput}
            placeholder={placeholder}
            required={required}
            fill='outline'
            label={label}
            labelPlacement='floating'
            className={className}
            style={{
                marginTop: "10px",
                "--color": "black",
            }}
        >
            <IonInputPasswordToggle slot='end' />
        </IonInput>
    ) : (
        <IonInput
            type={type}
            value={value}
            onIonInput={onIonInput}
            placeholder={placeholder}
            required={required}
            fill='outline'
            label={label}
            labelPlacement='floating'
            className={className}
            style={{
                marginTop: "10px",
                "--color": "black",
            }}
        />
    );
};

export default FormInput;
