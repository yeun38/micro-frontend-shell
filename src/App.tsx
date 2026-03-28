import { Suspense, lazy, useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import './App.css'
import { RemoteErrorBoundary } from './components/RemoteErrorBoundary'

const RemoteOrderList = lazy(() => import('archive/OrderList'))
const EmotionStoreInitializer = lazy(() => import('mfeHost/EmotionStoreInitializer'))
const RemoteBookRecommendation = lazy(() => import('chat/BookRecommendation'))

const AuthSection = lazy(() =>
  import('auth/authStore').then((module) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const useAuthStore = (module as any).default?.useAuthStore ?? (module as any).useAuthStore
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
              <div className="auth-user">
                <span>{user.displayName ?? user.email}</span>
                <button onClick={signOut}>로그아웃</button>
              </div>
            ) : (
              <button className="login-btn" onClick={signInWithGoogle}>
                Google 로그인
              </button>
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

/* ── /books 페이지 ── */
function BooksPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const userId = new URLSearchParams(location.search).get('userId')
  const emotions = (location.state as { emotions?: string[] })?.emotions ?? []

  return (
    <RemoteErrorBoundary name="BookRecommendation">
      <Suspense
        fallback={
          <div className="page-loading">
            <div className="page-spinner" />
            <p>책 추천 페이지 불러오는 중...</p>
          </div>
        }
      >
        <RemoteBookRecommendation userId={userId} emotions={emotions} onBack={() => navigate('/')} />
      </Suspense>
    </RemoteErrorBoundary>
  )
}

/* ── / 홈 페이지 ── */
function HomePage({
  userEmotions,
  isLoggedIn,
  userId,
}: {
  userEmotions: string[]
  isLoggedIn: boolean
  userId: string | null
}) {
  const navigate = useNavigate()

  return (
    <div className="shell-app">
      <header className="shell-header">
        <div className="shell-header-inner">
          <div className="shell-header-text">
            <h1>🏠 Main Application</h1>
            <p>마이크로프론트엔드 호스트 앱</p>
          </div>
          <RemoteModule name="Auth">
            <AuthSection />
          </RemoteModule>
        </div>
      </header>

      <main className="shell-main">
        {/* 감정 기반 도서 추천 섹션 */}
        <section className="content-section emotion-section">
          <div className="emotion-section-header">
            <h2>📖 나를 위한 책 찾기</h2>
            <p>지난 일주일간의 감정을 바탕으로 Gemini가 책을 추천해드려요</p>
          </div>

          {isLoggedIn ? (
            userEmotions.length > 0 ? (
              <div className="emotion-content">
                <div className="emotion-tag-row">
                  <span className="emotion-label-text">최근 감정</span>
                  <div className="shell-emotion-tags">
                    {userEmotions.map((e) => (
                      <span key={e} className="shell-emotion-tag">{e}</span>
                    ))}
                  </div>
                </div>
                <button
                  className="find-books-btn"
                  onClick={() => navigate(`/books?userId=${userId}`, { state: { emotions: userEmotions } })}
                >
                  이 감정들로 책 추천받기
                  <span className="btn-arrow">→</span>
                </button>
              </div>
            ) : (
              <div className="no-emotion">
                <span>😶</span>
                <p>아직 감정 기록이 없어요</p>
                <small>아래 Archive에서 주문 기록을 확인하면 감정 데이터가 채워집니다</small>
              </div>
            )
          ) : (
            <div className="no-emotion">
              <span>🔒</span>
              <p>로그인 후 감정 기반 책 추천을 받을 수 있어요</p>
            </div>
          )}
        </section>

        {/* MFE 설명 카드 */}
        <section className="content-section">
          <h2>마이크로프론트엔드 구성</h2>
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

        {/* 외부 MFE */}
        <section className="content-section remote-section">
          <h2>🔗 외부 MFE (Booked by Feelings)</h2>
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
    </div>
  )
}

/* ── App (라우터 루트) ── */
function App() {
  const [userEmotions, setUserEmotions] = useState<string[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // 로그인 상태 감지
  useEffect(() => {
    import('auth/authStore')
      .then((module) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mod = module as any
        const useAuthStore = mod.default?.useAuthStore ?? mod.useAuthStore
        if (!useAuthStore) return
        const update = () => {
          const user = useAuthStore.getState().user
          setIsLoggedIn(!!user)
          setUserId(user?.uid ?? null)
        }
        update()
        return useAuthStore.subscribe(update)
      })
      .catch((err) => console.warn('[authStore] 로드 실패:', err))
  }, [])

  // 감정 스토어 구독 (로그인 상태 변경 시 재구독)
  useEffect(() => {
    import('mfeHost/sharedEmotionStore')
      .then(({ useSharedEmotionStore }) => {
        const getEmotions = () => {
          const records = useSharedEmotionStore.getState().getRecentWeekRecords()
          console.log('[emotionStore] 전체 records:', records)
          const emotions = [...new Set(records.map((r) => r.emotion))]
          console.log('[emotionStore] 추출된 emotions:', emotions)
          return emotions
        }
        setUserEmotions(getEmotions())
        return useSharedEmotionStore.subscribe(() => {
          console.log('[emotionStore] store 변경 감지')
          setUserEmotions(getEmotions())
        })
      })
      .catch((err) => console.warn('[sharedEmotionStore] 로드 실패:', err))
  }, [isLoggedIn])

  return (
    <>
      {/* 로그인 후 store 초기화 (invisible) */}
      {isLoggedIn && (
        <RemoteModule name="EmotionInit">
          <EmotionStoreInitializer />
        </RemoteModule>
      )}

      <Routes>
        <Route
          path="/"
          element={<HomePage userEmotions={userEmotions} isLoggedIn={isLoggedIn} userId={userId} />}
        />
        <Route path="/books" element={<BooksPage />} />
      </Routes>
    </>
  )
}

export default App
