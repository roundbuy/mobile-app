import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VISITED_LINKS_KEY = '@visited_links';

const LinkHistoryContext = createContext({
    visitedLinks: {},
    markAsVisited: () => { },
    isVisited: () => false,
});

export const LinkHistoryProvider = ({ children }) => {
    const [visitedLinks, setVisitedLinks] = useState({});

    useEffect(() => {
        loadVisitedLinks();
    }, []);

    const loadVisitedLinks = async () => {
        try {
            const storedLinks = await AsyncStorage.getItem(VISITED_LINKS_KEY);
            if (storedLinks) {
                setVisitedLinks(JSON.parse(storedLinks));
            }
        } catch (error) {
            console.error('Failed to load visited links from storage', error);
        }
    };

    const markAsVisited = async (linkKey) => {
        if (!linkKey || visitedLinks[linkKey]) return;

        try {
            const updatedLinks = { ...visitedLinks, [linkKey]: true };
            setVisitedLinks(updatedLinks);
            await AsyncStorage.setItem(VISITED_LINKS_KEY, JSON.stringify(updatedLinks));
        } catch (error) {
            console.error('Failed to save visited link to storage', error);
        }
    };

    const isVisited = (linkKey) => {
        return !!visitedLinks[linkKey];
    };

    return (
        <LinkHistoryContext.Provider value={{ visitedLinks, markAsVisited, isVisited }}>
            {children}
        </LinkHistoryContext.Provider>
    );
};

export const useLinkHistory = () => useContext(LinkHistoryContext);
