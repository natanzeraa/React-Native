import BottomSheet from '@/components/templates/bottom-sheet'
import { BottomSheetMethods } from '@/components/templates/bottom-sheet/types'
import { Feather } from '@expo/vector-icons'
import { forwardRef, ReactNode } from 'react'
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'

type Action = {
    icon: string
    label: string
    color?: string
    onPress?: () => void
}

type SectionItemType =
    | 'text'
    | 'switch'

type SectionItem = {
    icon: string
    label: string
    type?: SectionItemType
    value?: boolean
    onPress?: () => void
    onToggle?: (
        active: boolean
    ) => void
}

type Section = {
    title: string
    items: SectionItem[]
}

interface UserPreferencesProps {
    name: string
    email: string
    actions?: Action[]
    sections?: Section[]
    children?: ReactNode
}

const UserPreferences = forwardRef<BottomSheetMethods, UserPreferencesProps>(
    ({ name, email, actions = [], sections = [], children }, ref) => {
        const renderRightContent = (item: SectionItem) => {
            if (item.type === 'switch') {
                return (
                    <Switch
                        value={item.value ?? false}
                        onValueChange={item.onToggle}
                        trackColor={{ false: '#444', true: '#7300ff' }}
                        thumbColor="#fff"
                        ios_backgroundColor="#444"
                    />
                )
            }

            return <Feather name="chevron-right" size={16} color="#444" />
        }

        return (
            <BottomSheet
                ref={ref}
                snapPoints={['50%', '90%']}
                backgroundColor="#1c1c1e"
                backdropOpacity={0.6}
                borderRadius={28}
            >
                <View style={styles.sheet}>
                    <View style={styles.header}>
                        <View style={styles.avatar}>
                            <Feather name="user" size={32} color="#fff" />
                        </View>

                        <Text style={styles.name}>{name}</Text>
                        <Text style={styles.email}>{email}</Text>
                    </View>

                    {!!actions.length && (
                        <View style={styles.row}>
                            {actions.map((action, index) => (
                                <View key={index} style={styles.actionWrapper}>
                                    <Pressable onPress={action.onPress} style={styles.rowItem}>
                                        <Feather
                                            name={action.icon as any}
                                            size={18}
                                            color={action.color || '#0a84ff'}
                                        />

                                        <Text
                                            style={[
                                                styles.rowText,
                                                { color: action.color || '#0a84ff' }
                                            ]}
                                        >
                                            {action.label}
                                        </Text>
                                    </Pressable>

                                    {index < actions.length - 1 && (
                                        <View style={styles.rowDivider} />
                                    )}
                                </View>
                            ))}
                        </View>
                    )}

                    {sections.map((section, sectionIndex) => (
                        <View key={sectionIndex}>
                            <Text style={styles.sectionTitle}>
                                {section.title}
                            </Text>

                            <View style={styles.list}>
                                {section.items.map((item, itemIndex) => {
                                    const isLast = itemIndex === section.items.length - 1
                                    const isSwitch = item.type === 'switch'
                                    const Wrapper = isSwitch ? View : Pressable

                                    return (
                                        <Wrapper
                                            key={itemIndex}
                                            {...(!isSwitch && {
                                                onPress: item.onPress
                                            })}
                                            style={[
                                                styles.listItem,
                                                isLast && styles.listItemLast
                                            ]}
                                        >
                                            <Feather
                                                name={item.icon as any}
                                                size={18}
                                                color="#888"
                                            />

                                            <Text style={styles.listText}>
                                                {item.label}
                                            </Text>

                                            {renderRightContent(item)}
                                        </Wrapper>
                                    )
                                })}
                            </View>
                        </View>
                    ))}

                    {children}
                </View>

            </BottomSheet>
        )
    }
)

UserPreferences.displayName = 'UserPreferences'

const styles = StyleSheet.create({
    sheet: {
        paddingHorizontal: 20,
        paddingTop: 16
    },

    header: {
        alignItems: 'center',
        marginBottom: 20
    },

    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#2c2c2e',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12
    },

    name: {
        fontSize: 20,
        color: '#fff',
        marginBottom: 4
    },

    email: {
        fontSize: 14,
        color: '#666'
    },

    row: {
        flexDirection: 'row',
        backgroundColor: '#2c2c2e',
        borderRadius: 14,
        marginBottom: 24
    },

    actionWrapper: {
        flex: 1,
        flexDirection: 'row'
    },

    rowItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14
    },

    rowDivider: {
        width: 1,
        backgroundColor: '#3a3a3c'
    },

    rowText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#0a84ff'
    },

    sectionTitle: {
        fontSize: 13,
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginLeft: 4
    },

    list: {
        backgroundColor: '#2c2c2e',
        borderRadius: 14,
        marginBottom: 20
    },

    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#3a3a3c'
    },

    listItemLast: {
        borderBottomWidth: 0
    },

    listText: {
        flex: 1,
        fontSize: 15,
        color: '#fff',
        marginLeft: 12
    }
})
export default UserPreferences