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
            heading: 'Lorem ipsum dolores est lorem ipsum dolores est:',
            align: 'left', // Left alignment
            list: [
                '1. LOREM IPSUM',
                '2. LOREM IPSUM',
                '3. LOREM IPSUM',
                '4. LOREM IPSUM',
            ],
            description: 'Free 1 year Green membership.\n\nLorem ipsum dolores est lorem ipsum dolores est.\n\nLorem ipsum dolores est lorem ipsum dolores est.\n\nLorem ipsum dolores est lorem ipsum dolores est.',
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
            title: 'LOREM IPSUM',
            list: [
                'Lorem ipsum dolores est sempre',
                'Lorem ipsum dolores est sempre',
                'Lorem ipsum dolores est sempre'
            ]
        },
        {
            id: 'step2',
            type: 'step',
            backgroundColor: '#FFFFFF',
            image: IMAGES.logoGreen,
            stepLabel: '2.',
            title: 'LOREM IPSUM',
            list: [
                'Lorem ipsum dolores est sempre',
                'Lorem ipsum dolores est sempre',
                'Lorem ipsum dolores est sempre'
            ]
        },
        {
            id: 'step3',
            type: 'step',
            backgroundColor: '#FFFFFF',
            image: IMAGES.logoGreen,
            stepLabel: '3.',
            title: 'LOREM IPSUM',
            list: [
                'Lorem ipsum dolores est sempre',
                'Lorem ipsum dolores est sempre',
                'Lorem ipsum dolores est sempre'
            ]
        },
        {
            id: 'finish',
            type: 'finish',
            backgroundColor: '#FFFFFF',
            image: IMAGES.logoGreen,
            stepLabel: '4.',
            title: 'LOREM IPSUM',
            list: [
                'Lorem ipsum dolores est sempre',
                'Lorem ipsum dolores est sempre',
                'Lorem ipsum dolores est sempre'
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
