import Header from '@/components/Header'
import ThemeToggle from '@/components/ThemeToggle'
import { createServerClient } from '@/utils/supabase'
import { cookies } from 'next/headers'
import Tweet from '@/components/Tweet'

const fetchTweets = async (supabase: any) => {
  const { data: tweets, error } = await supabase
    .from('dev_tweets')
    .select(
      `
    *,
    dev_account!inner (
      dev_profile (
        avatar_media_url
      ),
      username,
      account_display_name
    )
    
  `,
    )
    .order('created_at', { ascending: false })
    .limit(10)
  console.log('TWEETS')
  console.log(tweets)
  if (error) {
    console.error('Error fetching tweets:', error)
    throw error
  }

  return tweets
}

export default async function Page() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const tweets = await fetchTweets(supabase).catch(() => null)
  if (!tweets) {
    return <div>Error loading tweets</div>
  }
  return (
    <div className="flex w-full flex-1 flex-col items-center gap-20">
      <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
        <div className="flex w-full max-w-4xl items-center justify-between p-3 text-sm"></div>
      </nav>

      <div className="flex max-w-4xl flex-1 flex-col gap-20 px-3">
        <main className="flex flex-1 flex-col gap-6">
          <h2 className="mb-4 text-4xl font-bold">Recent Tweets</h2>
          {tweets.map((tweet: any) => (
            <Tweet
              key={tweet.id}
              username={tweet.dev_account?.username || 'Unknown'}
              displayName={tweet.dev_account?.account_display_name || 'Unknown'}
              // profilePicUrl is omitted for now
              profilePicUrl={
                tweet.dev_account?.dev_profile?.avatar_media_url ||
                'https://pbs.twimg.com/profile_images/1821884121850970112/f04rgSFD_400x400.jpg'
              }
              text={tweet.full_text}
              favoriteCount={tweet.favorite_count}
              retweetCount={tweet.retweet_count}
              date={tweet.created_at}
              tweetUrl={`https://twitter.com/${
                tweet.dev_account?.username || 'unknown'
              }/status/${tweet.tweet_id}`}
              replyToUsername={tweet.reply_to_username}
            />
          ))}
        </main>
      </div>

      <footer className="w-full justify-center border-t border-t-foreground/10 p-8 text-center text-xs">
        <ThemeToggle />
      </footer>
    </div>
  )
}