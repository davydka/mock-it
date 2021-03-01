import { graphql } from 'gatsby';
import React from 'react';
import styles from './index.module.scss';

interface IndexPageProps {
  data: {
    site: {
      siteMetadata: {
        name: string;
        tagline: string;
      },
    },
  };
}

export const indexPageQuery = graphql`
  query IndexPageQuery {
    site {
      siteMetadata {
        name
        tagline
      }
    }
  }
`;

export default class IndexPage extends React.Component<IndexPageProps, {}> {

  public render() {
    const {
      name,
      tagline,
    } = this.props.data.site.siteMetadata;

    return (
      <div className={styles.container}>
        <h1>{name}</h1>
        <p>{tagline}</p>
      </div>
    );
  }
}
