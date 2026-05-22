import Avatar from '@/components/base/avatar'
import { Title } from '@/components/base/title'
import BottomSheet from '@/components/templates/bottom-sheet'
import { BottomSheetMethods } from '@/components/templates/bottom-sheet/types'
import useAuth from '@/hooks/useAuth'
import { appointmentsService } from '@/service/appointmentsService'
import { authService } from '@/service/authService'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import UserPreferences from './userPreferences'

export interface Appointment {
    id: string
    client_name: string
    service: string
    date: string
    time: string
    status: 'confirmed' | 'pending' | 'cancelled'
    price: number
}

export interface AppointmentResponse {
    success: boolean
    status: number
    data: Appointment[]
}

export default function Index() {
    const { logout, user } = useAuth()

    const sheetRef = useRef<BottomSheetMethods>(null)

    const [totpUri, setTotpUri] = useState('')
    const [loading, setLoading] = useState(false)
    const [totpQrCode, setTotpQrCode] = useState('')
    const [twoFaEnabled, setTwoFaEnabled] = useState(Boolean(user?.twoFaEnabled))
    const [showTotpSetup, setShowTotpSetup] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [appointments, setAppointments] = useState<Appointment[]>([])

    async function loadAppointments() {
        try {
            setErrorMsg(null)
            setLoading(true)
            const response = await appointmentsService.findAll()
            setAppointments(response)
        } catch (error) {
            console.log(error)

            setErrorMsg('Não foi possível carregar os agendamentos')
            setAppointments([])
        } finally {
            setLoading(false)
        }
    }

    async function enableTotp() {
        try {
            setLoading(true)

            const payload = {
                name: user?.name || '',
                email: user?.email || ''
            }

            const response = await authService.enableTotp(payload)
            const data = response.data.data

            if (!response.data.success) {
                throw new Error(response.data.message)
            }

            setTotpQrCode(data.qrCode)
            setTotpUri(data.uri)
            setShowTotpSetup(true)

        } catch (error) {
            console.log(error)

            Alert.alert(
                'Erro',
                'Não foi possível gerar o QR Code'
            )
        } finally {
            setLoading(false)
        }
    }

    async function openAuthenticator() {
        if (!totpUri) return

        try {
            const supported = await Linking.canOpenURL(totpUri)

            if (supported) {
                await Linking.openURL(totpUri)
                return
            }

            Alert.alert(
                'Nenhum autenticador encontrado',
                'Instale Google Authenticator, Authy ou Microsoft Authenticator.'
            )
        } catch (error) {
            console.log(error)
        }
    }

    async function handleToggleTOTP(nextValue: boolean) {
        if (!nextValue) {
            setTwoFaEnabled(false)
            return
        }

        Alert.alert(
            'Ativar TOTP',
            'Deseja configurar autenticação em 2 fatores?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Confirmar',
                    onPress: enableTotp
                }
            ]
        )
    }

    useEffect(() => {
        loadAppointments()
    }, [])

    useEffect(() => {
        setTwoFaEnabled(Boolean(user?.twoFaEnabled))
    }, [user?.twoFaEnabled])

    return (
        <View style={styles.container} >
            <View style={styles.topSectionContainer}>
                <View style={styles.userInfoContainer}>
                    <Avatar
                        size={54}
                        borderColor='#7300ff'
                        image={{
                            uri: 'https://avatars.githubusercontent.com/u/172435339?s=400&u=1b0a021f2f57b0b857235a8dd0577ff63de34158&v=4'
                        }}
                        onPress={() => {
                            sheetRef.current?.snapToIndex(0)
                        }
                        }
                    />
                    <View style={styles.userDataContainer} >
                        <Title style={styles.title}>
                            <Text>{user?.name}</Text>
                        </Title>
                        <Text>{user?.email}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.appointmentsContainer}>
                <Title style={styles.appointmentsTitle}>
                    <Text>Meus Agendamentos</Text>
                </Title>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color="#7300ff"
                        />
                    </View>
                ) : (
                    <FlatList
                        data={appointments}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        refreshing={loading}
                        onRefresh={loadAppointments}
                        ListEmptyComponent={() => {
                            if (loading) {
                                return (
                                    <View style={styles.centerContainer}>
                                        <ActivityIndicator
                                            size="large"
                                            color="#7300ff"
                                        />
                                    </View>
                                )
                            }

                            if (errorMsg) {
                                return (
                                    <View style={styles.centerContainer}>
                                        <Text style={styles.errorTitle}>
                                            Ops, algo deu errado
                                        </Text>

                                        <Text style={styles.errorText}>
                                            {errorMsg}
                                        </Text>

                                        <Pressable
                                            style={styles.retryButton}
                                            onPress={loadAppointments}
                                        >
                                            <Text style={styles.retryText}>
                                                Tentar novamente
                                            </Text>
                                        </Pressable>
                                    </View>
                                )
                            }

                            return (
                                <View style={styles.centerContainer}>
                                    <Text style={styles.emptyText}>
                                        Nenhum agendamento encontrado
                                    </Text>
                                </View>
                            )
                        }}
                        renderItem={({ item }) => (
                            <View style={styles.appointmentCard}>
                                <View>
                                    <Text style={styles.clientName}>
                                        {item.client_name}
                                    </Text>

                                    <Text style={styles.serviceName}>
                                        {item.service}
                                    </Text>

                                    <Text style={styles.dateText}>
                                        {item.date} • {item.time}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={styles.priceText}>
                                        R$ {item.price.toFixed(2)}
                                    </Text>

                                    <Text
                                        style={[
                                            styles.statusText,
                                            {
                                                color:
                                                    item.status === 'confirmed'
                                                        ? '#22c55e'
                                                        : item.status === 'pending'
                                                            ? '#f59e0b'
                                                            : '#ef4444'
                                            }
                                        ]}
                                    >
                                        {item.status}
                                    </Text>
                                </View>
                            </View>
                        )}
                    />
                )}
            </View>
            <UserPreferences
                ref={sheetRef}
                name={user?.name || ''}
                email={user?.email || ''}
                actions={[
                    {
                        icon: 'log-out',
                        label: 'Logout',
                        color: '#ff453a',
                        onPress: logout
                    }
                ]}
                sections={[
                    {
                        title: 'Security',
                        items: [
                            {
                                icon: 'shield',
                                label: 'Enable TOTP',
                                type: 'switch',
                                value: twoFaEnabled,
                                onToggle: handleToggleTOTP
                            },
                        ]
                    }
                ]}
            />

            {showTotpSetup && (
                <BottomSheet
                    snapPoints={['65%']}
                    backgroundColor="#1c1c1e"
                    borderRadius={28}
                >
                    <View style={styles.qrContainer}>
                        <Text style={styles.qrTitle}>
                            Configure seu autenticador
                        </Text>

                        <Image
                            source={{ uri: totpQrCode }}
                            style={styles.qrCode}
                        />

                        <Pressable
                            style={styles.primaryButton}
                            onPress={openAuthenticator}
                        >
                            <Text style={styles.primaryText}>
                                Abrir autenticador
                            </Text>
                        </Pressable>

                        <Pressable
                            style={styles.secondaryButton}
                            onPress={() => {
                                setTwoFaEnabled(true)
                                setShowTotpSetup(false)
                            }}
                        >
                            <Text style={styles.secondaryText}>
                                Já configurei
                            </Text>
                        </Pressable>
                    </View>
                </BottomSheet>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topSectionContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10
    },
    userInfoContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: 10
    },
    userDataContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingLeft: 10
    },
    buttonContainer: {
        width: 180,
    },
    buttonText: {
        color: '#f4f4f4'
    },
    title: {
        color: '#222222',
    },
    appointmentsTitle: {
        color: '#222222',
        marginStart: 5,
        marginBottom: 15
    },
    appointmentsContainer: {
        flex: 1,
        marginTop: 30,
        paddingHorizontal: 10
    },
    appointmentCard: {
        width: '100%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2
    },

    clientName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#222'
    },

    serviceName: {
        marginTop: 4,
        color: '#666'
    },

    dateText: {
        marginTop: 6,
        fontSize: 12,
        color: '#999'
    },

    priceText: {
        fontWeight: '700',
        color: '#7300ff',
        textAlign: 'right'
    },

    statusText: {
        marginTop: 4,
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'right'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    qrContainer: {
        alignItems: 'center',
        padding: 24
    },

    qrTitle: {
        fontSize: 20,
        color: '#fff',
        fontWeight: '700',
        marginBottom: 20
    },

    qrCode: {
        width: 220,
        height: 220,
        marginBottom: 20
    },

    primaryButton: {
        width: '100%',
        backgroundColor: '#7300ff',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 12
    },

    primaryText: {
        color: '#fff',
        fontWeight: '600'
    },

    secondaryButton: {
        width: '100%',
        backgroundColor: '#2c2c2e',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center'
    },

    secondaryText: {
        color: '#fff'
    },

    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80
    },

    errorTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222'
    },

    errorText: {
        marginTop: 8,
        color: '#666',
        textAlign: 'center'
    },

    retryButton: {
        marginTop: 20,
        backgroundColor: '#7300ff',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 12
    },

    retryText: {
        color: '#fff',
        fontWeight: '600'
    },

    emptyText: {
        color: '#888',
        fontSize: 15
    }
})
