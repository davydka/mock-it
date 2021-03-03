import React from 'react';

import styles from './index.module.scss';

interface IProps {
  pathContext: {
    post: {
      id: number;
      title: string;
      body: string;
    },
  };
}

const PostPage: React.FC<IProps> = ({ pathContext }) => {
  const { post: { title, body } } = pathContext;

  return (
    <div className={styles.container}>
      <h1>{title}</h1>
      <p>{body}</p>
    </div>
  );
};

export default PostPage;
