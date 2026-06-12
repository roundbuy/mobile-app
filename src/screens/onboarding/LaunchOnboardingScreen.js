import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LaunchOnboardingModal from '../../components/onboarding/LaunchOnboardingModal';
import { useTranslation } from '../../context/TranslationContext';
import { useNavigation } from '@react-navigation/native';
import { IMAGES } from '../../assets/images'; // Assuming we have images, or we'll use placeholders

const LaunchOnboardingScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [visible, setVisible] = useState(true);

    const slides = [
        {
            id: 'welcome',
            type: 'welcome',
            backgroundColor: '#001C64', // Dark Blue
            image: IMAGES.logoGreen,
            title: 'RoundBuy',
            heading: 'Your Sustainable Local Marketplace:',
            align: 'left', // Left alignment
            list: [
                '1. Buy & Sell locally',
                '2. Save on every purchase',
                '3. Support your community',
                '4. Eco-friendly shopping',
            ],
            description: 'Free 1 year Green membership for early adopters.\n\nConnect with sellers in your neighborhood.\n\nSecure payments and verified users.\n\nStart your sustainable journey today.',
            buttons: [
                { text: 'Get Started', action: 'next', style: 'primary', textColor: '#000000', backgroundColor: '#FFFFFF' },
                { text: 'Skip', action: 'skip', style: 'secondary', textColor: '#000000', backgroundColor: '#FFFFFF' }
            ]
        },
        {
            id: 'step1',
            type: 'step',
            backgroundColor: '#FFFFFF',
            image: IMAGES.logoGreen,
            stepLabel: '1.',
            title: 'Find Local Deals',
            list: [
                'Browse products near you',
                'Filter by category and price',
                'Real-time availability updates'
            ]
        },
        {
            id: 'step2',
            type: 'step',
            backgroundColor: '#FFFFFF',
            image: IMAGES.logoGreen,
            stepLabel: '2.',
            title: 'Secure Transactions',
            list: [
                'Safe in-app payments',
                'Buyer protection guaranteed',
                'Verified seller ratings'
            ]
        },
        {
            id: 'step3',
            type: 'step',
            backgroundColor: '#FFFFFF',
            image: IMAGES.logoGreen,
            stepLabel: '3.',
            title: 'Eco-Friendly Choice',
            list: [
                'Reduce your carbon footprint',
                'Support local businesses',
                'Sustainable shopping made easy'
            ]
        },
        {
            id: 'finish',
            type: 'finish',
            backgroundColor: '#FFFFFF',
            image: IMAGES.logoGreen,
            stepLabel: '4.',
            title: 'Join the Community',
            list: [
                'Complete your profile',
                'Start browsing now',
                'Enjoy your Green membership'
            ],
            buttonText: "Let's get Started"
        }
    ];

    const handleFinish = () => {
        navigation.replace('Registration');
    };

    const handleSkip = () => {
        navigation.replace('Registration');
    };

    return (
        <View style={styles.container}>
            <LaunchOnboardingModal
                visible={visible}
                onClose={handleSkip}
                onFinish={handleFinish}
                slides={slides}
                tourId="launch_onboarding"
                embed={true} // New prop to render without Modal
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});

export default LaunchOnboardingScreen;
