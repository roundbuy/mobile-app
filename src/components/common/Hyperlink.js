import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useLinkHistory } from '../../context/LinkHistoryContext';
import { COLORS } from '../../constants/theme';

/**
 * A reusable Hyperlink component that automatically tracks "visited" state.
 * 
 * @param {string} linkKey - A unique identifier for the link (e.g., 'welcome_demo', 'search_instructions')
 * @param {function} onPress - The function to call when the link is pressed
 * @param {object} style - Optional custom text style that overrides the default
 * @param {string} unvisitedColor - Optional color for unvisited state (defaults to primary dark blue)
 * @param {string} visitedColor - Optional color for visited state (defaults to light blue)
 */
const Hyperlink = ({
    children,
    linkKey,
    onPress,
    style,
    unvisitedColor = COLORS.primary, // Typically #1a1a1a or #001C64 depending on location, defaults to primary
    visitedColor = '#4DA6FF', // Light blue visited color
    ...rest
}) => {
    const { isVisited, markAsVisited } = useLinkHistory();

    // Safety check, handle rendering without context or without a key gracefully
    const visited = linkKey ? isVisited(linkKey) : false;

    const handlePress = (e) => {
        if (linkKey) {
            markAsVisited(linkKey);
        }
        if (onPress) {
            onPress(e);
        }
    };

    return (
        <Text
            onPress={handlePress}
            style={[
                styles.defaultLink,
                style,
                { color: visited ? visitedColor : (style?.color || unvisitedColor) }
            ]}
            {...rest}
        >
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    defaultLink: {
        textDecorationLine: 'underline',
    }
});

export default Hyperlink;
