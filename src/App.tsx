import { Suspense, lazy, useState, useEffect } from 'react'
import './App.css'
import { RemoteErrorBoundary } from './components/RemoteErrorBoundary'

// apps/chat remote (Vite MFE)
const RemoteChatbot = lazy(() => import('chat/Chatbot'))

// Booked by Feelings (Webpack 5 MFE) remotes
const RemoteOrderList = lazy(() => import('archive/OrderList'))

// mfeHost store initializer
const EmotionStoreInitializer = lazy(() => import('mfeHost/EmotionStoreInitializer'))

// auth store — lazy to prevent crash before remote initializes
const AuthSection = lazy(() =>
  import('auth/authStore').then((module) => {
    const useAuthStore = module.default.useAuthStore
    return {
      default: function AuthSectionInner() {
        const { user, isLoading, signInWithGoogle, signOut, initAuthListener } = useAuthStore()

        useEffect(() => {
          const unsubscribe = initAuthListener()
          return unsubscribe
        }, [])
        return (
          <div className="auth-section">
            {isLoading ? (
              <span>로딩 중...</span>
            ) : user ? (
              <div>
                <span>{user.displayName ?? user.email}</span>
                <button onClick={signOut}>로그아웃</button>
              </div>
            ) : (
              <button onClick={signInWithGoogle}>Google 로그인</button>
            )}
          </div>
        )
      },
    }
  })
)

function RemoteModule({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <RemoteErrorBoundary name={name}>
      <Suspense fallback={<div className="remote-loading">{name} 로딩 중...</div>}>
        {children}
      </Suspense>
    </RemoteErrorBoundary>
  )
}

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [userEmotions, setUserEmotions] = useState<string[]>([])

  useEffect(() => {
    import('mfeHost/sharedEmotionStore')
      .then(({ useSharedEmotionStore }) => {
        const getEmotions = () => {
          const records = useSharedEmotionStore.getState().getRecentWeekRecords()
          return [...new Set(records.map((r) => r.emotion))]
        }
        setUserEmotions(getEmotions())
        return useSharedEmotionStore.subscribe(() => {
          setUserEmotions(getEmotions())
        })
      })
      .catch((err) => {
        console.warn('[sharedEmotionStore] 로드 실패:', err)
      })
  }, [])

  return (
    <div className="shell-app">
      <RemoteModule name="EmotionInit">
        <EmotionStoreInitializer />
      </RemoteModule>

      <header className="shell-header">
        <h1>🏠 Main Application (Shell)</h1>
        <p>이것은 마이크로프론트엔드 호스트 앱입니다</p>
        <RemoteModule name="Auth">
          <AuthSection />
        </RemoteModule>
      </header>

      <main className="shell-main">
        <section className="content-section">
          <h2>메인 콘텐츠 영역</h2>
          <p>
            여기에 메인 애플리케이션의 콘텐츠가 들어갑니다.
            오른쪽 하단의 채팅 버튼을 클릭하면 챗봇 모듈이 로드됩니다.
          </p>
          <div className="feature-cards">
            <div className="card">
              <h3>📦 Module Federation</h3>
              <p>런타임에 원격 모듈을 동적으로 로드합니다</p>
            </div>
            <div className="card">
              <h3>🔌 독립 배포</h3>
              <p>각 모듈은 독립적으로 개발 및 배포 가능합니다</p>
            </div>
            <div className="card">
              <h3>🔗 공유 의존성</h3>
              <p>React 등 공통 라이브러리를 공유합니다</p>
            </div>
          </div>
        </section>

        <section className="content-section remote-section">
          <h2>🔗 외부 MFE 모듈 (Booked by Feelings)</h2>
          <div className="remote-grid">
            <div className="remote-item">
              <h3>📚 Archive</h3>
              <RemoteModule name="OrderList">
                <RemoteOrderList />
              </RemoteModule>
            </div>
          </div>
        </section>
      </main>

      <button
        className="chat-toggle-btn"
        onClick={() => setIsChatOpen(!isChatOpen)}
        aria-label={isChatOpen ? '채팅 닫기' : '채팅 열기'}
      >
        {isChatOpen ? '✕' : '💬'}
      </button>

      {isChatOpen && (
        <div className="chatbot-container">
          <Suspense fallback={<div className="chatbot-loading">챗봇 로딩 중...</div>}>
            <RemoteChatbot emotions={userEmotions} />
          </Suspense>
        </div>
      )}
    </div>
  )
}

export default App
