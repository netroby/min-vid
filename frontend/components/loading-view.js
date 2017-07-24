import React from 'react';
import cn from 'classnames';
import GeneralControls from './general-controls';

export default class LoadingView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hovered: false};
  }

  enterView() {
    this.setState({hovered: true});
  }

  leaveView() {
    this.setState({hovered: false});
  }

  render() {
    return (
        <div className='loading' onMouseEnter={this.enterView.bind(this)} onMouseLeave={this.leaveView.bind(this)}>
          <div className={cn('controls drag', {hidden: !this.state.hovered, minimized: this.props.minimized})}>
            <div className='left' />
            <GeneralControls {...this.props} />
          </div>

          <div className="loading-wrapper">
            <img src='img/loading-bars.svg' alt='loading animation' width={64} height={64} />
            <p>{this.props.strings.loadingMsg}</p>
          </div>
        </div>
    );
  }
}
