import React from "react";
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
} from "@ionic/react";
import { OpportunityCost } from "../types";
import "./OpportunityCostDisplay.css";

interface OpportunityCostDisplayProps {
    opportunityCost: OpportunityCost;
}

const OpportunityCostDisplay: React.FC<OpportunityCostDisplayProps> = ({
    opportunityCost,
}) => {
    return (
        <IonCard className='opportunity-card'>
            <IonCardHeader>
                <IonCardTitle>Opportunity Cost</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                <div className='opportunity-content'>
                    <p className='opportunity-label'>This purchase equals:</p>
                    <div className='opportunity-value'>
                        <span className='value-number'>
                            {opportunityCost.equivalentUnits}
                        </span>
                        <span className='value-asset'>
                            {opportunityCost.assetName}
                        </span>
                    </div>
                    <p className='opportunity-explanation'>
                        At ${opportunityCost.assetPrice} per share, you're
                        giving up the potential for future wealth growth by
                        spending this money today.
                    </p>
                    <div className='opportunity-comparison'>
                        <div className='comparison-item'>
                            <span className='comparison-label'>
                                Spend Today
                            </span>
                            <span className='comparison-value'>
                                ${opportunityCost.productPrice.toFixed(2)}
                            </span>
                        </div>
                        <div className='comparison-arrow'>→</div>
                        <div className='comparison-item'>
                            <span className='comparison-label'>
                                Potential Value (5yr)
                            </span>
                            <span className='comparison-value potential'>
                                $
                                {(opportunityCost.productPrice * 1.5).toFixed(
                                    2,
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default OpportunityCostDisplay;
