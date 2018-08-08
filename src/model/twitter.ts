import {
  Typegoose,
  prop,
  instanceMethod,
  InstanceType,
  arrayProp,
} from 'typegoose';
import { CQImage } from 'dogq';
import { downloadImage } from '../util';

export default class Twitter extends Typegoose {
  @prop() public id: number;
  @prop() public text: string;
  @prop() public time: Date;
  @arrayProp({ items: String })
  public media: string[];
  @prop()
  public user: {
    id: number;
    name: string;
    screenName: string;
    description: string;
  };

  /**
   * Create a twitter model from the oiriginal twitter object in timeline
   * @param twitter original twitter object
   * @returns this for chaining calls
   */
  @instanceMethod
  public create(this: InstanceType<Twitter>, twitter: any) {
    this.id = twitter.id;
    this.time = new Date(twitter.created_at);
    this.text = twitter.full_text;
    this.media = [];
    this.user = {
      id: twitter.user.id,
      name: twitter.user.name,
      screenName: twitter.user.screen_name,
      description: twitter.user.description,
    };

    // expend urls
    if (twitter.entities.urls) {
      twitter.entities.urls.forEach((url: any) => {
        this.text = this.text.replace(url.url, url.expanded_url);
      });
    }

    // get medias
    if (twitter.entities.media) {
      const medias = twitter.extended_entities
        ? twitter.extended_entities.media
        : twitter.entities.media;
      medias.forEach((media: any) => {
        this.media.push(media.media_url);
        // remove useless media urls
        this.text = this.text.replace(media.url, '');
      });
    }
    return this;
  }

  /**
   * Convert the twitter to a repliable string.
   * @returns string
   */
  @instanceMethod
  public async toString(this: InstanceType<Twitter>) {
    // replace charactors that can't be displayed in gb18030
    const text = this.text
      // .replace(/・/g, '·')
      // .replace(/✕/g, '×')
      // .replace(/#千年戦争アイギス/g, '')
      // .replace(/♪/g, '')
      .trim();

    // download images
    const images = await Promise.all(
      this.media.map(media => downloadImage(media, 'twitter')),
    );

    // return the whole string
    return `====${
      this.user.name
    }====\n${this.time.toLocaleString()}\n${text}\n${images
      .map(image => new CQImage(image).toString())
      .join('')}`;
  }
}
