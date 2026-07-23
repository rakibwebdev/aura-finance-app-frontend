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
    const annualReturnRate = 0.1;
    const projectionYears = 5;
    const projectedAssetPrice =
        opportunityCost.assetPrice *
        Math.pow(1 + annualReturnRate, projectionYears);
    const projectedValue =
        opportunityCost.equivalentUnits * projectedAssetPrice;

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
                    <p className='opportunity-explanation'>
                        Assuming a {Math.round(annualReturnRate * 100)}% annual
                        return over {projectionYears} years.
                    </p>
                    <p className='opportunity-explanation'>
                        TSLA price now: ${opportunityCost.assetPrice.toFixed(2)}
                        . Projected TSLA price in {projectionYears} years: $
                        {projectedAssetPrice.toFixed(2)}.
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
                                ${projectedValue.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default OpportunityCostDisplay;
