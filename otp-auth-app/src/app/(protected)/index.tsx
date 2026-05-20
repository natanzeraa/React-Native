import Avatar from '@/components/base/avatar'
import { Button } from '@/components/base/button'
import { Title } from '@/components/base/title'
import useAuth from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'

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

const mockAppointments: Appointment[] = [
    {
        id: '1',
        client_name: 'Ana Silva',
        service: 'Esmaltação simples',
        date: '2025-09-01',
        time: '09:00',
        status: 'confirmed',
        price: 50
    },
    {
        id: '2',
        client_name: 'Cristiane Oliveira',
        service: 'Alongamento em gel',
        date: '2025-09-01',
        time: '10:30',
        status: 'confirmed',
        price: 120
    },
    {
        id: '3',
        client_name: 'Fernanda Souza',
        service: 'Banho de gel',
        date: '2025-09-01',
        time: '13:00',
        status: 'pending',
        price: 90
    },
    {
        id: '4',
        client_name: 'Juliana Costa',
        service: 'Spa das mãos + Nail art',
        date: '2025-09-01',
        time: '15:00',
        status: 'cancelled',
        price: 150
    }
]

export default function Index() {
    const { logout } = useAuth()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(false)

    async function loadAppointments() {
        try {
            console.log('Buscando dados')
            setLoading(true)
            await new Promise(resolve => setTimeout(resolve, 2000))
            setAppointments(mockAppointments)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadAppointments()
    }, [])

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
                    />
                    <Title style={styles.title}>
                        <Text>Natan</Text>
                    </Title>
                </View>
                <Button onPress={logout} loadingText='Carregando' backgroundColor='#7300ff' width={50} borderRadius={8}>
                    <Text style={styles.buttonText}>Sair</Text>
                </Button>
            </View>

            <View style={styles.appointmentsContainer}>
                <Title style={styles.title}>
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
    buttonContainer: {
        width: 180,
    },
    buttonText: {
        color: '#f4f4f4'
    },
    title: {
        color: '#222222',
        marginStart: 10,
        marginBottom: 10
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
    }
})