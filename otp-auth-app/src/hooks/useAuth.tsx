import { AuthContext } from '@/contexts/authContext'
import { useContext } from 'react'

export default function useAuth() {
    const context = useContext(AuthContext)
    return context
}