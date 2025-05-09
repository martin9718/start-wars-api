export interface MovieProperties {
  id?: string;
  title: string;
  episodeId: number;
  openingCrawl: string;
  director: string;
  producer: string;
  releaseDate: Date;
  url: string;
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class Movie {
  private constructor(
    readonly title: string,
    readonly episodeId: number,
    readonly openingCrawl: string,
    readonly director: string,
    readonly producer: string,
    readonly releaseDate: Date,
    readonly url: string,
    readonly externalId: string | undefined,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly id?: string,
    readonly deletedAt?: Date,
  ) {}

  static create(props: {
    title: string;
    episodeId: number;
    openingCrawl: string;
    director: string;
    producer: string;
    releaseDate: Date;
    url: string;
    externalId?: string;
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }): Movie {
    const now = new Date();

    return new Movie(
      props.title,
      props.episodeId,
      props.openingCrawl,
      props.director,
      props.producer,
      props.releaseDate,
      props.url,
      props.externalId,
      props.createdAt || now,
      props.updatedAt || now,
      props.id,
      props.deletedAt,
    );
  }

  toResponse(): Omit<MovieProperties, ''> & { id: string | undefined } {
    return {
      id: this.id,
      title: this.title,
      episodeId: this.episodeId,
      openingCrawl: this.openingCrawl,
      director: this.director,
      producer: this.producer,
      releaseDate: this.releaseDate,
      url: this.url,
      externalId: this.externalId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
