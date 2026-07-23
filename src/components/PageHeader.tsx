import React from "react";
import {
    IonBackButton,
    IonButtons,
    IonHeader,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import LogoutButton from "./LogoutButton";
import "./PageHeader.css";

interface PageHeaderProps {
    title: string;
    backHref?: string;
    showLogout?: boolean;
    rightContent?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    backHref,
    showLogout = true,
    rightContent,
}) => {
    return (
        <IonHeader>
            <IonToolbar color='primary' className='page-header-toolbar'>
                <div className='page-header-row'>
                    <div className='page-header-start'>
                        {backHref ? (
                            <IonBackButton defaultHref={backHref} />
                        ) : null}
                    </div>
                    <IonTitle>{title}</IonTitle>
                    <div className='page-header-end'>
                        {rightContent}
                        {showLogout ? <LogoutButton /> : null}
                    </div>
                </div>
            </IonToolbar>
        </IonHeader>
    );
};

export default PageHeader;
