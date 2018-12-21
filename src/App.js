import React, { Component } from 'react';
import './App.css';
import soundfilemp from './sonnerie.mp3'; //sonnerie creee personnellement
import ReactAudioPlayer from 'react-audio-player';



class Clock extends Component {
  constructor(props) {
    super(props);

    this.tempsSpecialModif.bind(this)
    this.state = {
      isWorking : true,
      isOn : false,
      isAlarm: false,
      count : 1,
      delais : 60 * 25,
      temps : 60 * 25,
      tempsSpecial : 0,
    };
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    if(this.state.temps > 0)
      this.setState({
        temps : Math.round((this.state.temps - 0.1) * 10 ) / 10       
      });
    else{
      this.playpause()
      clearInterval(this.timerID)
      this.setState({
        delais :  this.tempsTimer(),
        isWorking : !this.state.isWorking,
        temps : this.tempsTimer(),
        count : this.state.isWorking ? this.state.count : this.state.count + 1,
        isAlarm: true,
      });
    }
  }

  tempsTimer() { //defini le temps de session
  return this.state.isWorking === false ? 60 * 25 :
        this.state.count % 4 === 0 ? 60 * 15 + this.state.tempsSpecial:
        60 * 5;
  }

  playpause() {  
    if(!this.state.isOn) {
      this.timerID = setInterval(
        () => this.tick(),
        100
      );
      this.setState({
        isOn: true,
        isAlarm: false,
        });
    }
    else {
      clearInterval(this.timerID);
      this.setState({isOn: false});  
    }
  }
  
  tempsSpecialModif(n, e) {
    if(this.state.tempsSpecial + n  <= 5 && this.state.tempsSpecial + n  >= 0) 
      this.setState({
        tempsSpecial : this.state.tempsSpecial + n,
        delais : this.state.delais + 60 * n,
        temps : this.state.temps + 60 * n,
      });
  }

  pauseSpeciale() { //verifie si l'employe / etudiant peux prendre une pause plus long
    if(this.state.count % 4 === 0 && !this.state.isWorking)
      return true
    return false
  }

  render() {
    const contenu = this.state.isOn ? 
      <i className='fas fa-pause'></i> : 
        this.state.isWorking ?
        <i className='fas fa-play'></i> :
        this.state.delais === this.state.temps ?
          <i className='fas fa-redo'></i> : 
          <i className='fas fa-play'></i> 
           
    return (
      <div className='app'>
        <div className={this.state.isAlarm?'Clock seconds sonne':'Clock seconds'}>
          <DetailsNumeriques temps = {this.state.temps} isAlarm = {this.state.isAlarm} isOn = {this.state.isOn}/>
          <Cercle isWorking = {this.state.isWorking} temps = {this.state.temps} delais = {this.state.delais}/>   
          <br/>
          <div className='controles'>
            <button 
              onClick={this.tempsSpecialModif.bind(this, -1)} 
              disabled={this.state.tempsSpecial === 0? true : false} 
              className={this.pauseSpeciale()? 'minusplus Button': 'disabled'}>
                -1
            </button>
            <button onClick={this.playpause.bind(this)} className='Button'>
              {contenu}
            </button>
            <button 
              onClick={this.tempsSpecialModif.bind(this, 1)} 
              disabled={this.state.tempsSpecial === 5? true : false} 
              className={this.pauseSpeciale()? 'minusplus Button': 'disabled'}>
                +1
            </button>
          </div>
        </div>
        <Tasks isWorking = {this.state.isWorking} task = {this.state.task} taskHistory = {this.state.taskHistory}/>
        <Audio play = {this.state.isAlarm}/>
      </div>
    );
  }
}

class Tasks extends Component {
  constructor(props) {
    super(props);

    this.tache = this.tache.bind(this);
    this.state = {
      task : '',
      taskHistory : [],
    };
  }

  tache(event) { //enreristre la tache entree
    this.setState({task: event.target.value});
  }

  componentDidUpdate(prevProps) {
    if (!this.props.isWorking && prevProps.isWorking !== this.props.isWorking) {      
      const newArray = this.state.taskHistory.slice(); 
      newArray.push(this.state.task.length > 0 ? this.state.task : "Tâche vide")
      this.setState({
        task : '',
        taskHistory : newArray,
      });
    }
  }

  render() {
    const activity = this.props.isWorking ?
      <li><i className="fas fa-plus-circle"> </i> <input type="text" value={this.state.value} onChange={this.tache} className='activity' placeholder='Tâche...'/></li> :
      <li><i className="fas fa-mug-hot"> </i> <span className='activity'>Pause</span></li>

    const listItems = this.state.taskHistory.map((task) =>
        <li><i className="fas fa-check-circle"></i> {task}</li>
    );

    return <ul>
      {activity}
      {listItems}
    </ul>
  }
}

class DetailsNumeriques extends Component {
  constructor(props) {
    super(props);
  }

  doubleDigits(n) {
    return n < 10 ? '0' + n : n;
  }

  render() {
    const secondes = Math.round((this.props.temps % 60) * 10 ) / 10
    return <span className={!this.props.isOn? 'time hold' : 'time'}>
        {this.doubleDigits(Math.floor(this.props.temps / 60))}
        : 
        {this.doubleDigits(secondes)}
        {secondes % Math.round(secondes) === 0 ? '.0' : ''}
        <br/>
        <i className= {this.props.isAlarm ? 
          'fas fa-bell hold' : 
          this.props.isOn ? 
            'fas fa-stopwatch'  : 
            '' 
          }>
        </i>
    </span>
  }
}

function Cercle(props) {
  let progression = 0 
  const circumference = 2 * Math.PI * 100;

  if(props.isWorking) {
    progression = circumference - (props.temps/props.delais * circumference * 0.75)
  }
  else {
    progression =  circumference - ((1- (props.temps/props.delais)) * circumference * 0.75)
  }

  return <figure className='chart' viewBox='0 0 100 200' data-percent='75'>
      <svg width='220' height='220'>
        <circle className='outer'  strokeDashoffset={progression} strokeDasharray={circumference} cx='100' cy='85' r='100' transform='rotate(135 100 100)'/>
      </svg>
    </figure>
}

function Audio(props){
  if(props.play)
  return  <ReactAudioPlayer
    src={soundfilemp}
    autoPlay
    loop
  />
  return null
}

export default Clock;
