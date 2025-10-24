import "./list.scss";
import Card from "../card/Card";

// 👇 Accept new props
function List({ posts, onSave, onSendMessage, onDelete, showDelete }) {
  // Add basic validation for posts
  if (!Array.isArray(posts)) {
     console.warn("List component received non-array posts:", posts);
     return <div className='list'><p>No posts to display.</p></div>;
   }

  return (
    <div className='list'>
      {posts.map((item, index) => {
        // Ensure item is valid before rendering Card
        if (!item || !item.id) {
           console.warn("Skipping invalid item in list:", item);
           return null;
        }
        return (
          <Card
            key={item.id}
            item={item}
            onSave={onSave}
            onSendMessage={onSendMessage}
            // 👇 Pass new props down
            onDelete={onDelete}
            showDelete={showDelete}
            // --- End passing props ---
            style={{ "--card-index": index }}
          />
        );
      })}
       {/* Show message if posts array is empty after validation */}
       {posts.length === 0 && <p>No posts found.</p>}
    </div>
  );
}

export default List;
