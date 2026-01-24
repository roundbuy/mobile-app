import React from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import GlobalHeader from '../../components/GlobalHeader';

const PatentPendingScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const openURL = (url) => {
        Linking.openURL(url).catch((err) =>
            console.error('Failed to open URL:', err)
        );
    };

    const PatentIcon = () => (
        <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
                <Ionicons name="checkmark" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.iconText}>{t('PATENT PENDING')}</Text>
            <Text style={styles.iconSubtext}>{t('PATENT PENDING')}</Text>
        </View>
    );

    const SectionIcon = () => (
        <View style={styles.sectionIconContainer}>
            <View style={styles.sectionIconCircle}>
                <Ionicons name="document-text-outline" size={30} color={COLORS.primary} />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <GlobalHeader
                title={t('Pending patent')}
                navigation={navigation}
                showBackButton={true}
                showIcons={false}
            />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Patent Pending Icon */}
                <PatentIcon />

                {/* What is a patent? */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('What is a patent?')}</Text>
                    <Text style={styles.paragraph}>{t('A pending patent means an application has been filed, but not yet granted, signalling future rights. It serves as a public notice to potential infringers that the inventor is seeking protection and establishes a priority date for the invention, but it does not provide legal protection against infringement until the patent is issued.')}</Text>
                    <Text style={styles.paragraph}>{t('A granted patent is the final legal status, providing exclusive rights to the inventor to prevent others from making, using, or selling the invention.')}</Text>
                </View>

                <SectionIcon />

                {/* Where can I find more info on RoundBuy patents? */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Where can I find more info on RoundBuy patents?')}</Text>
                    <Text style={styles.paragraph}>{t('RoundBuy has pending patents, or filed patent applications, in both United Kingdom and Finland (for EU and International patents).')}</Text>
                    <Text style={styles.paragraph}>{t('For more info on pending patents click here:')}</Text>
                    <TouchableOpacity onPress={() => openURL('https://roundbuy.com/pending-patents/')}>
                        <Text style={styles.link}>{t('https://roundbuy.com/pending-patents/')}</Text>
                    </TouchableOpacity>

                    <Text style={styles.paragraph}>{t('To contact Finnish Patent Registration office click here:')}</Text>
                    <TouchableOpacity onPress={() => openURL('https://www.prh.fi/en/intellectualpropertyrights/patentit.html')}>
                        <Text style={styles.link}>{t('https://www.prh.fi/en/intellectualpropertyrights/patentit.html')}</Text>
                    </TouchableOpacity>

                    <Text style={styles.paragraph}>{t('To contact the Intellectual Property Office (UK):')}</Text>
                    <TouchableOpacity onPress={() => openURL('https://www.gov.uk/search-for-patent')}>
                        <Text style={styles.link}>{t('https://www.gov.uk/search-for-patent')}</Text>
                    </TouchableOpacity>
                </View>

                <SectionIcon />

                {/* What is the RoundBuy pending patent filed in Finland? */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('What is the RoundBuy pending patent filed in Finland?')}</Text>
                    <Text style={styles.paragraph}>{t('1. Patent pending: RoundBuy has filed patent to the Finnish patent and Registration Office (PRH, Patentti ja rekisterihallitus (PRH). See details below.')}</Text>
                    <Text style={styles.boldText}>{t('[INSERT HERE THE NAME OF THE PATENTED PRODUCT, TRADE NAME ALSO]')}</Text>
                    <Text style={styles.paragraph}>{t('[Insert brief description of your patented product here]')}</Text>
                    <Text style={styles.paragraph}>
                        Title of the invention: "Name of the patent application"{'\n'}
                        Application number: "e.g. 1223424232"
                    </Text>
                    <Text style={styles.paragraph}>{t('Link to Finnish Patent and Registration Office:')}</Text>
                    <TouchableOpacity onPress={() => openURL('https://www.prh.fi/en/intellectualpropertyrights/patentit.html')}>
                        <Text style={styles.link}>{t('https://www.prh.fi/en/intellectualpropertyrights/patentit.html')}</Text>
                    </TouchableOpacity>

                    <Text style={styles.paragraph}>{t('For more info on pending patents click here:')}</Text>
                    <TouchableOpacity onPress={() => openURL('https://roundbuy.com/pending-patents/')}>
                        <Text style={styles.link}>{t('https://roundbuy.com/pending-patents/')}</Text>
                    </TouchableOpacity>

                    <Text style={styles.paragraph}>{t('To contact Finnish Patent Registration office click here:')}</Text>
                    <TouchableOpacity onPress={() => openURL('https://www.prh.fi/en/intellectualpropertyrights/patentit.html')}>
                        <Text style={styles.link}>{t('https://www.prh.fi/en/intellectualpropertyrights/patentit.html')}</Text>
                    </TouchableOpacity>
                </View>

                <SectionIcon />

                {/* What is the RoundBuy pending patent filed in United Kingdom? */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('What is the RoundBuy pending patent filed in United Kingdom?')}</Text>
                    <Text style={styles.paragraph}>{t('2. Patent pending: RoundBuy has filed patent to the Intellectual Property Office. See details below.')}</Text>
                    <Text style={styles.boldText}>{t('[INSERT HERE THE NAME OF THE PATENTED PRODUCT, TRADE NAME ALSO]')}</Text>
                    <Text style={styles.paragraph}>{t('[Insert brief description of your patented product here]')}</Text>
                    <Text style={styles.paragraph}>
                        Title of the invention: "Name of the patent application"{'\n'}
                        Application number: "e.g. 1223424232"
                    </Text>
                    <Text style={styles.paragraph}>{t('Links to the Intellectual Property Office (in UK):')}</Text>
                    <TouchableOpacity onPress={() => openURL('https://www.gov.uk/search-for-patent')}>
                        <Text style={styles.link}>{t('https://www.gov.uk/search-for-patent')}</Text>
                    </TouchableOpacity>

                    <Text style={styles.paragraph}>{t('For more info on pending patents click here:')}</Text>
                    <TouchableOpacity onPress={() => openURL('https://roundbuy.com/pending-patents/')}>
                        <Text style={styles.link}>{t('https://roundbuy.com/pending-patents/')}</Text>
                    </TouchableOpacity>

                    <Text style={styles.paragraph}>{t('To contact the Intellectual Property Office (in UK):')}</Text>
                    <TouchableOpacity onPress={() => openURL('https://www.gov.uk/search-for-patent')}>
                        <Text style={styles.link}>{t('https://www.gov.uk/search-for-patent')}</Text>
                    </TouchableOpacity>
                </View>

                <SectionIcon />

                {/* Infringement and stealing? */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Infringement and stealing?')}</Text>
                    <Text style={styles.paragraph}>{t("Please contact us, so our team of lawyer's can start the proactive legal measures, in the cases you suspect there has been infringement of RoundBuy's IP rights.")}</Text>
                    <Text style={styles.paragraph}>{t("RoundBuy shall pursue legal case for possible infringers, whenever the patent is accepted if anyone infringement RoundBuy's IP rights. Copying RoundBuy's invention is technically \"stealing\" but not legally actionable \"infringement\" until the patent is issued. As the patent is granted we will sue infringers retrospectively from filing date onwards. If copying or stealing RoundBuy invention, you risk loosing all revenue gathered from the date of filing to RoundBuy. We shall take proactive steps immediately as our team of lawyer's find out of possible infringement, we shall also sue promptly as the patent is granted.")}</Text>
                    <Text style={styles.paragraph}>{t('Please refer to RoundBuy mobile app guide book for user manual of the service?')}</Text>
                    <Text style={styles.paragraph}>{t("This simplified user manual shows the RoundBuy mobile app, and it's main features in a PDF file with copyright. Please download it and see how the mobile essentially functions.")}</Text>
                    <Text style={styles.paragraph}>{t('Seek advice here how this kind of copyrighted user manual can protect the site?')}</Text>
                </View>

                <SectionIcon />

                {/* What other protected IP rights RoundBuy has? */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('What other protected IP rights RoundBuy has?')}</Text>
                    <Text style={styles.paragraph}>{t('RoundBuy has: Copyrights (c), trademarks (r), patents (pending or patents mark). These are all RoundBuy immaterial property, and we own all rights to their use.')}</Text>
                </View>

                <SectionIcon />

                {/* (NEW) Patent pending page */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('(NEW) Patent pending page')}</Text>
                    <Text style={styles.paragraph}>{t('On this page you can find information on RoundBuy pending patents and patents.')}</Text>
                    <Text style={styles.paragraph}>{t('We indicate clearly on our website, mobile apps and services the status "Pending Patent" or "Patent Applied for" or with similar phrasing to notify others that a patent application has been filed.')}</Text>
                    <Text style={styles.paragraph}>{t('We shall update the "Patent Pending" status to "patent" once the patent is granted.')}</Text>
                    <Text style={styles.paragraph}>{t('Note "Patent pending" is a notice and while patent pending provides no legal protection on its own. What it does it puts competitors on notice that a patent is being pursued for the invention and that they could be sued for infringement if they copy the invention and the patent is eventually granted.')}</Text>
                </View>

                <SectionIcon />

                {/* FINNISH PATENT PENDING */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('FINNISH PATENT PENDING (EU, International)')}</Text>
                    <Text style={styles.paragraph}>{t('1. Patent pending: RoundBuy has filed patent to the Finnish patent and Registration Office (PRH, Patentti ja rekisterihallitus (PRH). See details below.')}</Text>
                    <Text style={styles.boldText}>{t('[INSERT HERE THE NAME OF THE PATENTED PRODUCT, TRADE NAME ALSO]')}</Text>
                    <Text style={styles.paragraph}>{t('[Insert brief description of your patented product here]')}</Text>
                    <Text style={styles.paragraph}>
                        Title of the invention: "Name of the patent application"{'\n'}
                        Application number: "e.g. 1223424232"
                    </Text>
                    <Text style={styles.paragraph}>{t('Link to Finnish Patent and Registration Office:')}</Text>
                    <TouchableOpacity onPress={() => openURL('https://www.prh.fi/en/intellectualpropertyrights/patentit.html')}>
                        <Text style={styles.link}>{t('https://www.prh.fi/en/intellectualpropertyrights/patentit.html')}</Text>
                    </TouchableOpacity>

                    <Text style={styles.paragraph}>
                        Additional details:{'\n'}
                        Description what the app does:{'\n'}
                        Link to official website: https://roundbuy.com
                    </Text>

                    <Text style={styles.paragraph}>
                        Procedural updates:{'\n'}
                        1. Patent applied and filed for 30.09.2025{'\n'}
                        2. Date becoming public: it will become public after 18 months (Priority date) from the filing date (if it has not been cancelled or rejected). This date is: april/may 2027.
                    </Text>
                </View>

                <SectionIcon />

                {/* UK PATENT PENDING */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('UK PATENT PENDING (EU, International)')}</Text>
                    <Text style={styles.paragraph}>{t('2. Patent pending: RoundBuy has filed patent to the Intellectual Property Office. See details below.')}</Text>
                    <Text style={styles.boldText}>{t('[INSERT HERE THE NAME OF THE PATENTED PRODUCT, TRADE NAME ALSO]')}</Text>
                    <Text style={styles.paragraph}>{t('[Insert brief description of your patented product here]')}</Text>
                    <Text style={styles.paragraph}>
                        Title of the invention: "Name of the patent application"{'\n'}
                        Application number: "e.g. 1223424232"
                    </Text>
                    <Text style={styles.paragraph}>{t('The Intellectual Property Office:')}</Text>
                    <TouchableOpacity onPress={() => openURL('https://www.gov.uk/search-for-patent')}>
                        <Text style={styles.link}>{t('https://www.gov.uk/search-for-patent')}</Text>
                    </TouchableOpacity>

                    <Text style={styles.paragraph}>
                        Additional details:{'\n'}
                        Description what the app does:{'\n'}
                        Link to official website: https://roundbuy.com
                    </Text>

                    <Text style={styles.paragraph}>
                        Procedural updates:{'\n'}
                        1. Patent applied and filed for 31.12.2025{'\n'}
                        Date becoming public: it will become public after 18 months (Priority date) from the filing date (if it has not been cancelled or rejected). This date is: july 2027.
                    </Text>

                    <Text style={styles.paragraph}>{t('If the patent(s) will be granted, the protection begins from the date of filing, which means possible infringers and infringement will be liable to RoundBuy from that date onwards if using the protected invention in business activities.')}</Text>

                    <Text style={styles.paragraph}>{t('For RoundBuy the invention, for which patent has been filed, forms the essential component of its activities and business model and concept.')}</Text>

                    <Text style={styles.paragraph}>{t('Once an inventor has filed a patent application with the Patent office, he can claim patent pending status for the invention, which starts immediately.')}</Text>

                    <Text style={styles.paragraph}>{t('Once the "Patent pending" has been approved by the Patent Office, you must change the patent pending marking status on the website, mobile app and service so the current state of your patent is reflected.')}</Text>

                    <Text style={styles.paragraph}>{t('We will update patent page regularly. For more information on RoundBuy pending patents please get in touch!')}</Text>
                </View>

                {/* Additional Resources */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Additional Resources')}</Text>
                    <Text style={styles.paragraph}>{t('For more on EU patents:')}</Text>
                    <TouchableOpacity onPress={() => openURL('https://europa.eu/youreurope/business/running-business/intellectual-property/patents/index_en.htm')}>
                        <Text style={styles.link}>{t('https://europa.eu/youreurope/business/running-business/intellectual-property/patents/index_en.htm')}</Text>
                    </TouchableOpacity>

                    <Text style={styles.paragraph}>{t('For more on International patents:')}</Text>
                    <TouchableOpacity onPress={() => openURL('https://patentscope.wipo.int/search/en/search.jsf')}>
                        <Text style={styles.link}>{t('https://patentscope.wipo.int/search/en/search.jsf')}</Text>
                    </TouchableOpacity>

                    <Text style={styles.paragraph}>{t('For more on Finnish patents:')}</Text>
                    <TouchableOpacity onPress={() => openURL('https://www.prh.fi/en/intellectualpropertyrights/patentit.html')}>
                        <Text style={styles.link}>{t('https://www.prh.fi/en/intellectualpropertyrights/patentit.html')}</Text>
                    </TouchableOpacity>

                    <Text style={styles.paragraph}>{t('For more on UK patents:')}</Text>
                    <TouchableOpacity onPress={() => openURL('https://www.gov.uk/government/collections/intellectual-property-patents')}>
                        <Text style={styles.link}>{t('https://www.gov.uk/government/collections/intellectual-property-patents')}</Text>
                    </TouchableOpacity>

                    <Text style={styles.paragraph}>{t('Email to us:')}</Text>
                    <TouchableOpacity onPress={() => openURL('mailto:patents@roundbuy.com')}>
                        <Text style={styles.link}>{t('patents@roundbuy.com')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    iconContainer: {
        alignItems: 'center',
        marginVertical: 30,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    iconText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1a1a1a',
        marginTop: 5,
    },
    iconSubtext: {
        fontSize: 10,
        fontWeight: '500',
        color: '#666',
        marginTop: 2,
    },
    sectionIconContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    sectionIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 22,
        color: '#333',
        marginBottom: 12,
    },
    boldText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    link: {
        fontSize: 14,
        color: COLORS.primary,
        textDecorationLine: 'underline',
        marginBottom: 12,
    },
});

export default PatentPendingScreen;
