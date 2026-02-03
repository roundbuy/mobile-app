import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import CampaignNotificationPopup from './CampaignNotificationPopup';

/**
 * Campaign Notification Popup Manager
 * Manages the 3-state popup display
 */
function CampaignNotificationPopupManager({ navigationRef }) {
    const { popupNotification, closePopup } = useNotifications();

    // Create a navigation object from the ref
    const navigation = navigationRef?.current ? {
        navigate: (screen, params) => {
            navigationRef.current?.navigate(screen, params);
        },
        goBack: () => {
            navigationRef.current?.goBack();
        }
    } : null;

    return (
        <CampaignNotificationPopup
            notification={popupNotification}
            onClose={closePopup}
            navigation={navigation}
        />
    );
}

export default CampaignNotificationPopupManager;
