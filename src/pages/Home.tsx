import { IonContent, IonPage } from "@ionic/react";
import ExploreContainer from "../components/ExploreContainer";
import PageHeader from "../components/PageHeader";
import "./Home.css";

const Home: React.FC = () => {
    return (
        <IonPage>
            <PageHeader title='Aura Finance' showLogout={false} />
            <IonContent fullscreen>
                <ExploreContainer />
            </IonContent>
        </IonPage>
    );
};

export default Home;
