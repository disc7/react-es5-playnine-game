var possibleCombinationSum = function(arr, n) {
  if (arr.indexOf(n) >= 0) { return true; }
  if (arr[0] > n) { return false; }
  if (arr[arr.length - 1] > n) {
    arr.pop();
    return possibleCombinationSum(arr, n);
  }
  var listSize = arr.length, combinationsCount = (1 << listSize)
  for (var i = 1; i < combinationsCount ; i++ ) {
    var combinationSum = 0;
    for (var j=0 ; j < listSize ; j++) {
      if (i & (1 << j)) { combinationSum += arr[j]; }
    }
    if (n === combinationSum) { return true; }
  }
  return false;
};

var StarsFrame = React.createClass({
  render: function() {
    var stars = [];
    for (var i = 0; i < this.props.numberOfStars; i++) {
      stars.push(
        <span className="glyphicon glyphicon-star"></span>
      );
    }

    return (
      <div id="stars-frame">
        <div className="well">
          {stars}
        </div>
      </div>
    );
  }
});


var ButtonFrame = React.createClass({
  render: function() {
    var disabled;
    var button;
    var correct = this.props.correct;

    switch(correct) {
      case true:
        button = (
          <button className="btn btn-success btn-lg"
                  onClick={this.props.acceptAnswer}>
            <span className="glyphicon glyphicon-ok"></span>
          </button>
        );
        break;
      case false:
        button = (
          <button className="btn btn-danger btn-lg">
            <span className="glyphicon glyphicon-remove"></span>
          </button>
        );
        break;
      default:
        disabled = (this.props.selectedNumbers.length === 0);
        button = (
          <button
            className="btn btn-primary btn-lg"
            disabled={disabled}
            onClick={this.props.checkAnswer}>
            =
          </button>
        );
    }

    return (
      <div id="button-frame">
        {button}
        <br/>
        <button
          className="btn btn-warning btn-xs"
          onClick={this.props.redraw}
          disabled={this.props.numberOfRedrawsRemaining === 0}>
          <span className="glyphicon glyphicon-refresh"></span>
          &nbsp;
          {this.props.numberOfRedrawsRemaining}
        </button>
      </div>
    );
  }
});


var AnswerFrame = React.createClass({
  render: function() {
    var props = this.props;
    var selectedNumbers = props.selectedNumbers.map(function(i) {
      return (
          <span onClick={props.unselectNumber.bind(null, i)}>
            {i}
          </span>
        )
    });
    return (
      <div id="answer-frame">
        <div className="well">
          {selectedNumbers}
        </div>
      </div>
    );
  }
});

var NumbersFrame = React.createClass({
  render: function() {
    var numbers = [];
    var className;
    var selectNumber = this.props.selectNumber;
    var usedNumbers = this.props.usedNumbers;
    var selectedNumbers = this.props.selectedNumbers;
    for (var i = 1; i <= 9; i++) {
      className = "number selected-" + (selectedNumbers.indexOf(i) >= 0);
      className += " used-" + (usedNumbers.indexOf(i) >= 0);
      numbers.push(
        <div className={className} onClick={selectNumber.bind(null, i)}>
          {i}
        </div>
      );
    }
    return (
      <div id="numbers-frame">
        <div className="well">
          {numbers}
        </div>
      </div>
    );
  }
});

var DoneFrame = React.createClass({
  render: function() {
    return (
      <div className="well text-center">
        <h2>{this.props.doneStatus}</h2>
        <button
          className="btn btn-default"
          onClick={this.props.resetGame}>
            Play again
        </button>
      </div>
    )
  }
});

var Game = React.createClass({
  getInitialState: function() {
    return {
      selectedNumbers: [],
      usedNumbers: [],
      numberOfStars: this.getNumberStars(),
      correct: null,
      numberOfRedrawsRemaining: 5,
      doneStatus: null
    };
  },
  resetGame: function() {
    this.replaceState(this.getInitialState());
  },
  getNumberStars: function() {
    return Math.floor(Math.random()*9) + 1;
  },
  selectNumber: function(clickedNumber) {
    var selectedNumbers = this.state.selectedNumbers;
    if (selectedNumbers.indexOf(clickedNumber) === -1) {
      this.setState(
        { selectedNumbers: selectedNumbers.concat(clickedNumber),
          correct: null }
      )
    }
  },
  unselectNumber: function(clickedNumber) {
    var selectedNumbers = this.state.selectedNumbers;
    var indexOfNumber = selectedNumbers.indexOf(clickedNumber);
    selectedNumbers.splice(indexOfNumber, 1);
    this.setState(
      { selectedNumbers: selectedNumbers, correct: null }
    )
  },
  sumOfSelectedNumbers: function() {
    return this.state.selectedNumbers.reduce(function(p,n) {
      return p+n;
    }, 0)
  },
  checkAnswer: function() {
    var correct = (this.state.numberOfStars === this.sumOfSelectedNumbers());
    this.setState({ correct: correct});
  },
  acceptAnswer: function() {
    var usedNumbers = this.state.usedNumbers.concat(this.state.selectedNumbers);
    this.setState({
      selectedNumbers: [],
      usedNumbers: usedNumbers,
      correct: null,
      numberOfStars: this.getNumberStars()
    }, function() {
      this.updateDoneStatus();
    });
  },
  redraw: function() {
    var numberOfRedrawsRemaining = this.state.numberOfRedrawsRemaining;
    if (numberOfRedrawsRemaining > 0) {
      this.setState({
        numberOfStars: this.getNumberStars(),
        correct: null,
        selectedNumbers: [],
        numberOfRedrawsRemaining: numberOfRedrawsRemaining -1
      }, function() {
        this.updateDoneStatus();
      });
    }
  },
  possibleSolutions: function() {
    var numberOfStars = this.state.numberOfStars,
        possibleNumbers = [],
        usedNumbers = this.state.usedNumbers;

    for (var i = 1; i < 9; i++) {
      if (usedNumbers.indexOf(i) < 0) {
        possibleNumbers.push(i);
      }
    }

    console.log('possibleNumbers: ' + possibleNumbers);
    console.log('numberOfStars: ' + numberOfStars);

    return possibleCombinationSum(possibleNumbers, numberOfStars);
  },
  updateDoneStatus: function() {
    console.log(this.state.usedNumbers.length);
    console.log(this.state.numberOfRedrawsRemaining);
    console.log(this.possibleSolutions());
    if (this.state.usedNumbers.length === 9) {
      this.setState({ doneStatus: 'You Won!'});
      return;
    }

    if (this.state.numberOfRedrawsRemaining === 0 &&
        !this.possibleSolutions()) {
      this.setState({ doneStatus: 'Game Over!'});
    }
  },
  render: function() {
    var selectedNumbers = this.state.selectedNumbers,
        usedNumbers = this.state.usedNumbers,
        numberOfStars = this.state.numberOfStars,
        correct = this.state.correct,
        doneStatus = this.state.doneStatus,
        numberOfRedrawsRemaining = this.state.numberOfRedrawsRemaining,
        bottomFrame;

    if (doneStatus) {
      bottomFrame = <DoneFrame
                      doneStatus={doneStatus}
                      resetGame={this.resetGame} />;
    } else {
      bottomFrame = <NumbersFrame
                      selectedNumbers={selectedNumbers}
                      usedNumbers={usedNumbers}
                      selectNumber={this.selectNumber} />;
    }

    return (
      <div id="game">
        <h2>Play Nine</h2>
          <div className="clearfix">
          <hr />
          <StarsFrame numberOfStars={numberOfStars} />
          <ButtonFrame
            selectedNumbers={selectedNumbers}
            correct={correct}
            checkAnswer={this.checkAnswer}
            acceptAnswer={this.acceptAnswer}
            redraw={this.redraw}
            numberOfRedrawsRemaining={numberOfRedrawsRemaining}
          />
          <AnswerFrame
            selectedNumbers={selectedNumbers}
            unselectNumber={this.unselectNumber}
          />
        </div>

        {bottomFrame}
      </div>
    );
  }
});


React.render(
  <Game />,
  document.getElementById('container')
);
