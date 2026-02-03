/**
 * Quick Integration Guide for Campaign Notifications
 * 
 * Add this code to NotificationCenterScreen.js to display campaign notifications
 */

// 1. At the top, add these imports (after line 17):
import CampaignNotificationCard from '../../components/CampaignNotificationCard';
import CampaignNotificationExpanded from '../../components/CampaignNotificationExpanded';
import CampaignNotificationModal from '../../components/CampaignNotificationModal';

// 2. In useNotifications destructuring (around line 21), add campaignNotifications:
const {
    notifications,
    campaignNotifications,  // ADD THIS LINE
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = useNotifications();

// 3. Add state for expanded campaign notifications (after line 33):
const [expandedCampaignId, setExpandedCampaignId] = useState(null);
const [modalNotification, setModalNotification] = useState(null);

// 4. Update the FlatList data prop (around line 232):
// CHANGE FROM:
data = { getFilteredNotifications() }

// CHANGE TO:
data = { [...(campaignNotifications || []), ...getFilteredNotifications()] }

// 5. Update keyExtractor (around line 234):
// CHANGE FROM:
keyExtractor = {(item) => item.user_notification_id.toString()}

// CHANGE TO:
keyExtractor = {(item) => `${item.type_key ? 'campaign-' : 'regular-'}${item.user_notification_id || item.id}`}

// 6. Add modal before closing SafeAreaView (before line 248):
{/* Campaign Notification Modal */ }
<CampaignNotificationModal
    visible={!!modalNotification}
    notification={modalNotification}
    onClose={() => setModalNotification(null)}
    navigation={navigation}
/>

// 7. Update renderNotificationItem function (around line 135):
const renderNotificationItem = ({ item }) => {
    // Check if it's a campaign notification
    if (item.type_key) {
        const isExpanded = expandedCampaignId === item.user_notification_id;

        if (isExpanded) {
            return (
                <CampaignNotificationExpanded
                    notification={item}
                    onCollapse={() => setExpandedCampaignId(null)}
                    onOpenModal={() => setModalNotification(item)}
                    navigation={navigation}
                />
            );
        } else {
            return (
                <CampaignNotificationCard
                    notification={item}
                    onPress={() => setExpandedCampaignId(item.user_notification_id)}
                    onDismiss={() => console.log('Dismiss:', item.user_notification_id)}
                />
            );
        }
    }

    // Regular notification (keep existing code)
    return (
        <TouchableOpacity
            style={styles.notificationItem}
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.7}
        >
            {/* ... existing notification rendering code ... */}
        </TouchableOpacity>
    );
};

/**
 * That's it! Campaign notifications will now display in your notification center.
 * They will appear at the top of the list with:
 * - Collapsed view (tap to expand)
 * - Expanded view with buttons (tap again to collapse or open modal)
 * - Full-screen modal view
 */
