import "./list.scss";
import Card from "../card/Card";

function List({ posts, onSave, onSendMessage }) {
  return (
    <div className='list'>
      {/* Index ko map se lekar Card ko pass karna zaroori hai */}
      {posts.map((item, index) => (
        <Card
          key={item.id}
          item={item}
          onSave={onSave}
          onSendMessage={onSendMessage}
          // 👇 YEH STYLE PROP ANIMATION DELAY KE LIYE HAI 👇
          style={{ "--card-index": index }}
        />
      ))}
    </div>
  );
}

export default List;