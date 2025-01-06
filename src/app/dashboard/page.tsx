import PageGuard from '@/components/PageGuard'

const Dashboard = () => {
	return <PageGuard requireAuth>This is dashboard</PageGuard>
}

export default Dashboard
