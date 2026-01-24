import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS } from '../../constants/theme';
import paddleService from '../../services/paddleService';

const PaddlePaymentScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
  const {
    total = '2.27',
    planType = 'Gold',
    planName = 'Gold membership plan',
    planId,
    currencyCode = 'USD'
  } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [checkoutHtml, setCheckoutHtml] = useState('');
  const [transactionId, setTransactionId] = useState(null);
  const webViewRef = useRef(null);

  useEffect(() => {
    initializePaddleCheckout();
  }, []);

  const initializePaddleCheckout = async () => {
    try {
      setLoading(true);

      // Get Paddle configuration
      const config = await paddleService.getClientToken();
      
      // Create transaction
      const transaction = await paddleService.createTransaction(planId, currencyCode);
      setTransactionId(transaction.transaction_id);

      // Generate embedded checkout HTML
      const html = generateCheckoutHTML(config.client_token, transaction);
      setCheckoutHtml(html);
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Failed to initialize Paddle checkout:', error);
      Alert.alert(
        t('Initialization Error'),
        t('Unable to load payment form. Please try again.'),
        [
          { text: t('Go Back'), onPress: () => navigation.goBack() }
        ]
      );
    }
  };

  const generateCheckoutHTML = (clientToken, transaction) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <title>Paddle Checkout</title>
  <script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #FFFFFF;
      padding: 20px;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
    }
    .header {
      margin-bottom: 24px;
      text-align: center;
    }
    .header h1 {
      font-size: 20px;
      font-weight: 700;
      color: #000;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 14px;
      color: #666;
    }
    .amount-box {
      background: #F5F5F5;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
      text-align: center;
    }
    .amount-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .amount {
      font-size: 32px;
      font-weight: 700;
      color: #000;
    }
    .plan-name {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }
    #paddle-checkout-container {
      min-height: 400px;
    }
    .loading {
      text-align: center;
      padding: 40px;
    }
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid ${COLORS.primary};
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .error {
      background: #FEE;
      border: 1px solid #E99;
      border-radius: 8px;
      padding: 12px;
      margin: 16px 0;
      color: #C33;
    }
    .success {
      background: #EFE;
      border: 1px solid #9E9;
      border-radius: 8px;
      padding: 12px;
      margin: 16px 0;
      color: #3C3;
    }
    .paddle-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Choose a payment method</h1>
      <p>Secure payment powered by Paddle</p>
    </div>

    <div class="amount-box">
      <div class="amount-label">Total Amount</div>
      <div class="amount">${currencyCode} ${total}</div>
      <div class="plan-name">${planName}</div>
    </div>

    <div id="paddle-checkout-container">
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading secure payment form...</p>
      </div>
    </div>
  </div>

  <script>
    // Initialize Paddle
    Paddle.Environment.set('${config.environment || 'sandbox'}');
    Paddle.Initialize({
      token: '${clientToken}',
      eventCallback: function(event) {
        console.log('Paddle event:', event);
        
        // Send message to React Native
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'paddle_event',
            event: event
          }));
        }

        // Handle specific events
        if (event.name === 'checkout.completed') {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'payment_success',
              data: event.data
            }));
          }
        } else if (event.name === 'checkout.error') {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'payment_error',
              error: event.data
            }));
          }
        } else if (event.name === 'checkout.closed') {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'checkout_closed'
            }));
          }
        }
      }
    });

    // Open checkout
    setTimeout(function() {
      Paddle.Checkout.open({
        transactionId: '${transaction.transaction_id}',
        displayMode: 'inline',
        frameTarget: 'paddle-checkout-container',
        frameInitialHeight: 450,
        frameStyle: 'width: 100%; min-width: 312px; background-color: transparent; border: none;'
      });
    }, 500);
  </script>
</body>
</html>
    `;
  };

  const handleWebViewMessage = async (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('WebView message:', message);

      switch (message.type) {
        case 'payment_success':
          setProcessing(true);
          // Wait a bit for backend to process webhook
          setTimeout(async () => {
            try {
              // Verify transaction status
              if (transactionId) {
                const status = await paddleService.getTransactionStatus(transactionId);
                navigation.replace('TransactionStatus', {
                  success: true,
                  amount: total,
                  planType,
                  planName,
                  transactionId: transactionId,
                  paymentMethod: 'Paddle'
                });
              }
            } catch (error) {
              console.error('Error verifying transaction:', error);
              // Still navigate to success since Paddle confirmed
              navigation.replace('TransactionStatus', {
                success: true,
                amount: total,
                planType,
                planName,
                transactionId: transactionId,
                paymentMethod: 'Paddle'
              });
            }
          }, 2000);
          break;

        case 'payment_error':
          Alert.alert(
            t('Payment Failed'),
            message.error?.message || t('Unable to process payment. Please try again.'),
            [
              { text: t('Try Again'), onPress: () => initializePaddleCheckout() },
              { text: 'Cancel', onPress: () => navigation.goBack(), style: 'cancel' }
            ]
          );
          break;

        case 'checkout_closed':
          // User closed the checkout
          console.log('Checkout closed by user');
          break;

        case 'paddle_event':
          // Log other Paddle events
          console.log('Paddle event:', message.event);
          break;
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  if (loading) {
    return (
      <SafeScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('Initializing secure payment...')}</Text>
        </View>
      </SafeScreenContainer>
    );
  }

  return (
    <SafeScreenContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={processing}
          >
            <Text style={styles.backButtonText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.securityBadge}>
            <Text style={styles.securityText}>{t('🔒 Secure Payment')}</Text>
          </View>
        </View>

        {/* WebView with Paddle Checkout */}
        <WebView
          ref={webViewRef}
          source={{ html: checkoutHtml }}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
            Alert.alert(t('Error'), t('Unable to load payment form. Please try again.'));
          }}
        />

        {processing && (
          <View style={styles.processingOverlay}>
            <View style={styles.processingCard}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.processingText}>{t('Processing payment...')}</Text>
              <Text style={styles.processingSubtext}>{t('Please wait')}</Text>
            </View>
          </View>
        )}
      </View>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#000',
    fontWeight: '600',
  },
  securityBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  securityText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  processingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  processingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default PaddlePaymentScreen;