import { Typegoose, prop, instanceMethod, InstanceType } from 'typegoose';

export default class Youtube extends Typegoose {
  @prop() public id: string;
  @prop() public time: Date;
  @prop() public title: string;
  @prop() public status: string;
  @prop() public channelTitle: string;

  @instanceMethod
  public create(this: InstanceType<Youtube>, youtube: any) {
    this.title = youtube.snippet.title;
    this.id = youtube.id.videoId;
    this.time = new Date(youtube.snippet.publishedAt);
    this.status = youtube.snippet.liveBroadcastContent;
    this.channelTitle = youtube.snippet.channelTitle;
    return this;
  }

  @instanceMethod
  public getUrl() {
    return `https://www.youtube.com/watch?v=${this.id}`;
  }

  @instanceMethod
  public equals(this: InstanceType<Youtube>, other: InstanceType<Youtube>) {
    return this.id === other.id && this.status === other.status;
  }
}
