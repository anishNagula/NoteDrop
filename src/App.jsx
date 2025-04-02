import React, { useState, useEffect } from 'react'
import { createClient } from "@supabase/supabase-js";
import './App.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [heading, setHeading] = useState('Give it a heading...');
  const [content, setContent] = useState('Type the text to send...');
  const [shareLink, setShareLink] = useState('');

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);


  const path = window.location.pathname;
  const isViewPage = path.startsWith('/p/');
  const id = isViewPage ? path.split('/p/')[1] : null;


  useEffect(() => {
    if (isViewPage && id) {
      setLoading(true);
      supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching post:', error);
          } else {
            setPost(data);
          }
          setLoading(false);
        });
    }
  }, [isViewPage, id]);


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const { data, error } = await supabase
      .from('posts')
      .insert([{ heading, content }])
      .select();
  
    if (error) {
      console.error('Error inserting post:', error);
      return;
    }
  
    if (!data || data.length === 0) {
      console.error('Unexpected error: No data returned from insert.');
      return;
    }
  
    const newPost = data[0];
    const link = `${window.location.origin}/p/${newPost.id}`;
    setShareLink(link);
  };


  if (isViewPage) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        {loading ? (
          <p>Loading...</p>
        ) : post ? (
          <div>
            <h1>{post.heading}</h1>
            <p>{post.content}</p>
            <button onClick={() => navigator.clipboard.writeText(post.content)}>
              Copy Text
            </button>
          </div>
        ) : (
          <p>Post not found.</p>
        )}
      </div>
    );
  }


  return (
    <div className='main'>
      <h1>NoteDrop</h1>
      <h3>Drop Your Text - (it's safe 🤫)</h3>
      <form onSubmit={handleSubmit}>
        <div className='heading-cont'>
          <label>Heading:</label>
          <input
            type="text"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div className='heading-cont'>
          <label>Content:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            style={{ width: '100%', height: '150px' }}
          />
        </div>
        <button type="submit">Send</button>
      </form>
      {shareLink && (
        <div style={{ marginTop: '20px' }}>
          <p>Share this link:</p>
          <a href={shareLink}>{shareLink}</a>
        </div>
      )}
    </div>
  );
}

export default App;
