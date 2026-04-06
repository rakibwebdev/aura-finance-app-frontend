import React, { useState } from "react";
import { IonPage, IonContent, IonButton, IonIcon } from "@ionic/react";
import { arrowForward } from "ionicons/icons";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./Onboarding.css";

interface OnboardingProps {
    onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [swiperInstance, setSwiperInstance] = useState<any>(null);

    const nextSlide = () => {
        if (currentSlide === 2) {
            onComplete();
        } else if (swiperInstance) {
            swiperInstance.slideNext();
        }
    };

    return (
        <IonPage>
            <IonContent fullscreen className='onboarding-content'>
                <div className='onboarding-container'>
                    <Swiper
                        modules={[Pagination]}
                        pagination={{ clickable: true }}
                        speed={400}
                        onSwiper={setSwiperInstance}
                        onSlideChange={(swiper) =>
                            setCurrentSlide(swiper.activeIndex)
                        }
                    >
                        <SwiperSlide>
                            <div className='slide-content'>
                                <div className='slide-icon'>💰</div>
                                <h1>Smart Budget Tracking</h1>
                                <p>
                                    Track your spending in real-time with our
                                    intuitive AR-powered scanner
                                </p>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <div className='slide-content'>
                                <div className='slide-icon'>📊</div>
                                <h1>Visual Impact Analysis</h1>
                                <p>
                                    See exactly how each purchase affects your
                                    budget with beautiful visualizations
                                </p>
                            </div>
                        </SwiperSlide>

                        <SwiperSlide>
                            <div className='slide-content'>
                                <div className='slide-icon'>🎯</div>
                                <h1>Achieve Your Goals</h1>
                                <p>
                                    Set goals and watch them come to life in AR
                                    as you save towards your dreams
                                </p>
                            </div>
                        </SwiperSlide>
                    </Swiper>

                    <div className='onboarding-footer'>
                        <div className='slide-indicators'>
                            <span
                                className={currentSlide === 0 ? "active" : ""}
                            ></span>
                            <span
                                className={currentSlide === 1 ? "active" : ""}
                            ></span>
                            <span
                                className={currentSlide === 2 ? "active" : ""}
                            ></span>
                        </div>
                        <IonButton
                            expand='block'
                            onClick={nextSlide}
                            className='next-button'
                        >
                            {currentSlide === 2 ? "Get Started" : "Next"}
                            <IonIcon slot='end' icon={arrowForward} />
                        </IonButton>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Onboarding;
