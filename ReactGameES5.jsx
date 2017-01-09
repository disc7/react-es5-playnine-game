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

var StarsFrame = React.createClass({
  render: function() {
    var className,
          numberOfStars,
          stars = [];

    // Check if game has been won
    if (this.props.doneStatus === 1) {
      numberOfStars = 9;
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
    var disabled,
        button,
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
        usedNumbers = this.props.usedNumbers,
        selectedNumbers = this.props.selectedNumbers;
    for (var i = 1; i <= 9; i++) {
      className = "number selected-" + (selectedNumbers.indexOf(i) >= 0);
      className += " used-" + (usedNumbers.indexOf(i) >= 0);
      clickHandler = (usedNumbers.indexOf(i) >= 0) ? null : selectNumber.bind(null, i);
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
    return (
      <div className="well text-center">
        <h2>{this.props.doneStatusTitle}</h2>
        <p>{this.props.doneStatusMessage}</p>
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
      numberOfRedrawsRemaining: 9,
      doneStatus: null,
      previousNumberOfStars: previousNumberOfStars
    };
  },
  resetGame: function() {
    this.replaceState(this.getInitialState());
  },
  getRandomNumberStars: function() {
    return Math.floor(Math.random()*9) + 1;
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

    for (var i = 1; i < 9; i++) {
      if (usedNumbers.indexOf(i) < 0) {
        possibleNumbers.push(i);
      }
    }

    return possibleCombinationSum(possibleNumbers, numberOfStars);
  },
  updateDoneStatus: function() {
    if (this.state.usedNumbers.length === 9) {
      this.setState({
          doneStatus: 1,
          doneStatusTitle: 'You Won!',
          doneStatusMessage: ''
      });
      return;
    }

    if (this.state.numberOfRedrawsRemaining === 0 &&
        !this.possibleSolutions()) {
      this.setState({
          doneStatus: 0,
          doneStatusTitle: 'Game Over!',
          doneStatusMessage: 'No more number combinations available.'
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
        doneStatusMessage = this.state.doneStatusMessage,
        numberOfRedrawsRemaining = this.state.numberOfRedrawsRemaining,
        bottomFrame;

    // Game over (not complete)
    if (doneStatus === 0) {
      numberOfStars = this.state.previousNumberOfStars;
      bottomFrame = <div>
                      <NumbersFrame
                        selectedNumbers={selectedNumbers}
                        usedNumbers={usedNumbers}
                        selectNumber={this.selectNumber} />
                      <DoneFrame
                        doneStatusTitle={doneStatusTitle}
                        doneStatusMessage={doneStatusMessage}
                        resetGame={this.resetGame} />
                    </div>;
    } else if (doneStatus === 1) {
      bottomFrame = <DoneFrame
                        doneStatusTitle={doneStatusTitle}
                        doneStatusMessage={doneStatusMessage}
                        resetGame={this.resetGame} />
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
