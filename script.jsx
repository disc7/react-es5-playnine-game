var possibleCombinationSum = function(arr, n) {
  if (arr.indexOf(n) >= 0) { return true; }
  if (arr[0] > n) { return false; }
  if (arr[arr.length - 1] > n) {
    arr.pop();
    return possibleCombinationSum(arr, n);
  }
  var combinationSum;
  var listSize = arr.length, combinationsCount = (1 << listSize)
  for (var i = 1; i < combinationsCount ; i++ ) {
    combinationSum = 0;
    for (var j=0 ; j < listSize ; j++) {
      if (i & (1 << j)) { combinationSum += arr[j]; }
    }
    if (n === combinationSum) { return true; }
  }
  return false;
};

var NUMBER_OF_STARS = 9;
var NUMBER_REDRAWS_REMAINING = 9;
var STATUS_GAME_COMPLETED = 1;
var STATUS_GAME_INCOMPLETED = 0;

var StarsFrame = React.createClass({
  render: function() {
    var className,
          numberOfStars,
          stars = [];

    if (this.props.doneStatus === STATUS_GAME_COMPLETED) {
      numberOfStars = NUMBER_OF_STARS;
      className = "glyphicon glyphicon-star normal-right-spinner";
    } else {
      numberOfStars = this.props.numberOfStars;
      className = "glyphicon glyphicon-star";
    }
    for (var i = 0; i < numberOfStars; i++) {
      stars.push(
        <span className={className}></span>
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
    var checkAnsweredDisabled,
        button,
        refreshDisabled = (this.props.numberOfRedrawsRemaining === 0 ||
                                     (this.props.doneStatus === STATUS_GAME_INCOMPLETED ||
                                      this.props.doneStatus === STATUS_GAME_COMPLETED)),
        correct = this.props.correct;
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
        checkAnsweredDisabled = (this.props.selectedNumbers.length === 0);
        button = (
          <button
            className="btn btn-primary btn-lg"
            disabled={checkAnsweredDisabled}
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
          disabled={refreshDisabled}>
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
    var props = this.props,
        selectedNumbers = props.selectedNumbers.map(function(i) {
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
    var numbers = [],
        className,
        clickHandler,
        selectNumber = this.props.selectNumber,
        unselectNumber = this.props.unselectNumber,
        usedNumbers = this.props.usedNumbers,
        selectedNumbers = this.props.selectedNumbers;

    for (var i = 1; i <= NUMBER_OF_STARS; i++) {
      className = "number selected-" + (selectedNumbers.indexOf(i) >= 0);
      className += " used-" + (usedNumbers.indexOf(i) >= 0);

      // If number has been used disable clickHandler
      if (usedNumbers.indexOf(i) >= 0) {
        clickHandler = null;
      } else {
        // If number has not been used toggle selectability
        if (selectedNumbers.indexOf(i) >= 0) {
          clickHandler = unselectNumber.bind(null, i);
        } else {
          clickHandler = selectNumber.bind(null, i);
        }
      }

      numbers.push(
        <div className={className} onClick={clickHandler}>
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
    var numbers = [],
          numberOrNumbers = '',
          numbersRemaining = [],
          numbersRemainingMessage = '',
          usedNumbers = this.props.usedNumbers;
    for (var i = 1; i < NUMBER_OF_STARS +1; i++) {
      if (usedNumbers.indexOf(i) === -1) {
        numbers.push(
          <div className="number selected-false">
            {i}
          </div> );
      }
    }

    if (numbers.length > 1) {
      numberOrNumbers = 's';
    }

    if (this.props.doneStatus === STATUS_GAME_INCOMPLETED) {
      numbersRemainingMessage = <p>You were left with the following number{numberOrNumbers}: {numbers}</p>;
    }

    return (
      <div id="done-frame" className="well text-center">
        <h2>{this.props.doneStatusTitle}</h2>
        {numbersRemainingMessage}
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
    var numberOfStars = this.getRandomNumberStars(),
        previousNumberOfStars = numberOfStars;
    return {
      selectedNumbers: [],
      usedNumbers: [],
      numberOfStars: numberOfStars,
      correct: null,
      numberOfRedrawsRemaining: NUMBER_REDRAWS_REMAINING,
      doneStatus: null,
      previousNumberOfStars: previousNumberOfStars
    };
  },
  resetGame: function() {
    this.replaceState(this.getInitialState());
  },
  getRandomNumberStars: function() {
    return Math.floor(Math.random()*NUMBER_OF_STARS) + 1;
  },
  getNumberStars: function() {
    var numberStars = this.getRandomNumberStars(),
        previousNumberOfStars = this.state.previousNumberOfStars;
    while (numberStars === previousNumberOfStars) {
      numberStars = this.getRandomNumberStars();
    }
    this.setState({previousNumberOfStars: numberStars});
    return numberStars;
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
    var selectedNumbers = this.state.selectedNumbers,
        indexOfNumber = selectedNumbers.indexOf(clickedNumber);
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

    for (var i = 1; i < NUMBER_OF_STARS; i++) {
      if (usedNumbers.indexOf(i) < 0) {
        possibleNumbers.push(i);
      }
    }

    return possibleCombinationSum(possibleNumbers, numberOfStars);
  },
  updateDoneStatus: function() {
    if (this.state.usedNumbers.length === NUMBER_OF_STARS) {
      this.setState({
          doneStatus: 1,
          doneStatusTitle: 'You Won!'
      });
      return;
    }

    if (this.state.numberOfRedrawsRemaining === 0 &&
        !this.possibleSolutions()) {
      this.setState({
          doneStatus: 0,
          doneStatusTitle: 'Game Over!'
      });
    }
  },
  render: function() {
    var selectedNumbers = this.state.selectedNumbers,
        usedNumbers = this.state.usedNumbers,
        numberOfStars = this.state.numberOfStars,
        correct = this.state.correct,
        doneStatus = this.state.doneStatus,
        doneStatusTitle = this.state.doneStatusTitle,
        numberOfRedrawsRemaining = this.state.numberOfRedrawsRemaining,
        bottomFrame;

    if (doneStatus === STATUS_GAME_INCOMPLETED) {
      numberOfStars = this.state.previousNumberOfStars;
      bottomFrame = <DoneFrame
                        doneStatus={doneStatus}
                        usedNumbers={usedNumbers}
                        doneStatusTitle={doneStatusTitle}
                        resetGame={this.resetGame} />;
    } else if (doneStatus === STATUS_GAME_COMPLETED) {
      bottomFrame = <DoneFrame
                        usedNumbers={usedNumbers}
                        doneStatusTitle={doneStatusTitle}
                        resetGame={this.resetGame} />
    } else {
      bottomFrame = <NumbersFrame
                      selectedNumbers={selectedNumbers}
                      usedNumbers={usedNumbers}
                      unselectNumber={this.unselectNumber}
                      selectNumber={this.selectNumber} />;
    }

    return (
      <div id="game">
        <h2>Play Nine</h2>
          <div className="clearfix">
          <hr />
          <StarsFrame
            numberOfStars={numberOfStars}
            doneStatus={doneStatus}
          />
          <ButtonFrame
            selectedNumbers={selectedNumbers}
            correct={correct}
            checkAnswer={this.checkAnswer}
            acceptAnswer={this.acceptAnswer}
            redraw={this.redraw}
            numberOfRedrawsRemaining={numberOfRedrawsRemaining}
            doneStatus={doneStatus}
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
