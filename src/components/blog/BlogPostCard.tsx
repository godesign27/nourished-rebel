import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import type { BlogPost } from '../../types';
import { formatReadingTime } from '../../utils/readingTime';

interface BlogPostCardProps {
  post: BlogPost;
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const imageUrl = post.cover_image?.url || post.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
  const imageAlt = post.cover_image?.alt_text || post.title;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(post.published_at || post.publish_date)}</span>
          </div>
          {post.reading_time && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{formatReadingTime(post.reading_time)}</span>
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        <p className="text-gray-600 line-clamp-3 mb-4">
          {post.excerpt || post.summary}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
