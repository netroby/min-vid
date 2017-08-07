import React from 'react';
import cn from 'classnames';
import ReactTooltip from 'react-tooltip';
import formatTime from '../client-lib/format-time';
import sendToAddon from '../client-lib/send-to-addon';

const playIcon = '../data/img/play-blue.svg';
const addIcon = '../data/img/add.svg';
const errorIcon = '../data/img/static-static.png';

export default class Item extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hovered: false};
  }

  remove() {
    sendToAddon({
      action: 'track-removed',
      index: this.props.index,
      isHistory: this.props.isHistory
    });
  }

  enterItem() {
    this.setState({hovered: true});
  }

  leaveItem() {
    this.setState({hovered: false});
  }

  play() {
    // the goal here is to get the track index, move it to the top
    // of the queue, and play it.
    // We also need to handle the currently playing track correctly.
    //
    // If track 0 in the queue is not playing, and hasn't been
    // played at all(currentTime == 0), we should move the newTrack
    // to the top of the queue and play it.
    //
    // If track 0 in the queue is playing or has been played
    // (currentTime > 0), we should move track 0 into the history
    // array, and then move newTrack to the top of the queue

    if (this.props.audio) this.props.audio.pause();

    sendToAddon({
      action: 'track-expedited',
      moveIndexZero: Boolean(window.AppData.currentTime),
      index: this.props.index,
      isHistory: this.props.isHistory
    });
  }

  add() {
    sendToAddon({
      index: this.props.index,
      action: 'track-added-from-history'
    });
  }

  render() {
    const style = {
      backgroundImage: `url(${this.props.error ? errorIcon : this.props.preview})`,
      filter: (this.state.hovered) ? 'opacity(60%) grayscale(20%)' : ''
    };

    let columnOneContent;

    if (this.props.isHistory) {
      columnOneContent = <a className='add-from-history' onClick={this.add.bind(this)}><img src={addIcon} /></a>;
    } else if (this.props.index) {
      columnOneContent = <p>{this.props.index + 1}</p>;
    } else {
      columnOneContent = <img src={playIcon} />;
    }

    const dragHandle = (this.props.shouldDrag && this.props.index) ?
                       (<div className={cn('drag-handle', {hidden: !this.state.hovered})}></div>)
                       : null;

    const thumbnailIcon = ((!this.props.index && !this.props.isHistory) ?
                         <a onClick={this.props.replay.bind(this)} className={cn('repeat', {hidden: !this.state.hovered})} /> :
                         <a onClick={this.play.bind(this)} className={cn('play', {hidden: !this.state.hovered})} />);

    const duration = this.props.duration ? (<span className='queue-item-time'>{formatTime(this.props.duration)}</span>) : null;

    return (<li className='queue-item'
                onMouseEnter={this.enterItem.bind(this)}
                onMouseLeave={this.leaveItem.bind(this)}>

              <div className='queue-item-left'>
                {dragHandle}
                {columnOneContent}
              </div>
              <div className='queue-item-thumbnail'>
                <div style={style}></div>
                {thumbnailIcon}
              </div>
              <div className='queue-item-info'>
                <h5 className='queue-item-title' data-tip data-for={`title-${this.props.index}`}>{this.props.title}</h5>
                <ReactTooltip id={`title-${this.props.index}`} effect='solid'>
                  {this.props.title}
                </ReactTooltip>
                <span className='queue-item-domain'>{this.props.domain}</span>
                {duration}
                <a className={cn('queue-item-remove', {hidden: !this.state.hovered})} onClick={this.remove.bind(this)} />
              </div>
            </li>);
  }
}
