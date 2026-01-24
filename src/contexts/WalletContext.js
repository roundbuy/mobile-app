import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { walletService } from '../services';

const WalletContext = createContext();

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

export const WalletProvider = ({ children }) => {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWallet = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await walletService.getWallet();
            if (response.success) {
                // Extract wallet from response.data.wallet (not just response.data)
                setWallet(response.data.wallet);
            } else {
                setError(response.message || 'Failed to fetch wallet');
            }
        } catch (err) {
            console.error('Error fetching wallet:', err);
            setError(err.message || 'Failed to fetch wallet');
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshWallet = useCallback(async () => {
        await fetchWallet();
    }, [fetchWallet]);

    const updateBalance = useCallback((newBalance) => {
        setWallet(prev => prev ? { ...prev, balance: newBalance } : null);
    }, []);

    const deductBalance = useCallback((amount) => {
        setWallet(prev => {
            if (!prev) return null;
            return {
                ...prev,
                balance: (parseFloat(prev.balance) - parseFloat(amount)).toFixed(2)
            };
        });
    }, []);

    const addBalance = useCallback((amount) => {
        setWallet(prev => {
            if (!prev) return null;
            return {
                ...prev,
                balance: (parseFloat(prev.balance) + parseFloat(amount)).toFixed(2)
            };
        });
    }, []);

    useEffect(() => {
        fetchWallet();
    }, [fetchWallet]);

    const value = {
        wallet,
        loading,
        error,
        refreshWallet,
        updateBalance,
        deductBalance,
        addBalance,
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};
