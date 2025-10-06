import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useReviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            rating,
            comment,
            created_at,
            users!inner(name, email)
          `)
          .order('created_at', { ascending: false })

        if (error) {
          setError(error.message)
        } else {
          setReviews(data || [])
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  return { reviews, loading, error }
}
