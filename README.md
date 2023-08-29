# Solidity patterns

솔리디티의 다양한 패턴에 대해서 다루어보려고 한다.

본 글에서는 가스비 최적화에 대한것 보다는 가독성 및 유지보수에 초점을 맞추어서 작성하였다.

## 참고 링크

https://fravoll.github.io/solidity-patterns/

## Guard Check

Guard를 통해 스마트 컨트랙트 및 해당 입력 매개변수의 유효성을 검증.

스마트 컨트랙트의 바람직한 동작은 필요한 모든 상황을 확인하고 모든 것이 의도한 대로인 경우에만 진행하는 것이다.

이를 `Guard Check Pattern`이라고 한다.

단순 require 문을 활용해도 좋고, `modifier`를 활용해도 좋다.

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract GuardCheck {
    modifier addressGuard(address addr) {
        require(addr != address(0), "address should be a valid address");

        _;
    }

    modifier valueGuard(uint value) {
        require(msg.value != 0, "msg.value should be a valid value");

        _;
    }

    function donate(
        address addr
    ) public payable addressGuard(addr) valueGuard(msg.value) {
        // ...
    }
}
```

## State Machine

스마트 컨트랙트에서 서비스 로직을 구현하는 경우, 생애 주기를 관리해야 하는 경우가 있다. 

시간에 따라서, 단계에 따라서 등 다양한 경우가 있을 수 있다.

다음과 같은 경우에 상태를 가지도록 구현할 수 있다.

- 스마트 컨트랙트는 수명 주기동안 여러 단계로 전환해야한다.
- 스마트 컨트랙트의 기능은 특정 단계에서만 접근 가능해야한다. 
- 사용자의 행동에 따라서 스마트 컨트랙트의 상태가 변경되어야 한다.

Solidity 에서는 다양한 단계를 모델링하기 위해 `enum`을 사용할 수 있다.

특정 단계에 대한 기능 액세스 제한은 뒤에서 다룰 `Access Restriction`을 활용하면 된다.

위에서 다룬 `Guard Check` 패턴과 관련이 있으나 중구난방으로 진행하면 정신없으니 일단 `State Machine`의 코드를 보고 넘어가보자.

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

contract StateMachine {
    // Stage에 대한 enum을 정의한다.
    enum Stages {
        AcceptingBlindBids,
        RevealBids,
        WinnerDetermined,
        Finished
    }

    Stages public stage = Stages.AcceptingBlindBids;

    uint public creationTime = now;

    modifier atStage(Stages _stage) {
        require(stage == _stage);
        _;
    }

    modifier transitionAfter() {
        _;
        nextStage();
    }

    modifier timedTransitions() {
        if (stage == Stages.AcceptingBlindBids && now >= creationTime + 6 days) {
            nextStage();
        }
        if (stage == Stages.RevealBids && now >= creationTime + 10 days) {
            nextStage();
        }
        _;
    }

    function bid() public payable timedTransitions atStage(Stages.AcceptingBlindBids) {
        // Implement biding here
    }

    function reveal() public timedTransitions atStage(Stages.RevealBids) {
        // Implement reveal of bids here
    }

    function claimGoods() public timedTransitions atStage(Stages.WinnerDetermined) transitionAfter {
        // Implement handling of goods here
    }

    function cleanup() public atStage(Stages.Finished) {
        // Implement cleanup of auction here
    }

    function nextStage() internal {
        stage = Stages(uint(stage) + 1);
    }
}
```

위의 예시는 Stage에 따라 컨트랙트 자체의 상태가 바뀐다. 


## Access Restriction

스마트 컨트랙트는 블록체인에 배포되면 누구나 접근할 수 있다.

공개적인 특성으로 인해 스마트 컨트랙트에 대한 완전한 정보 보호를 보장하는 것은 불가능에 가깝다. 

모든 정보가 모두에게 표시되기때문에 누군가가 블록체인에서 컨트랙트 상태를 읽는 것을 막을수가 없다. 

함수를 `private`으로 선언하는 선택지도 있지만, 그렇게 하면 모든 사람이 함수를 호출할 수 없게된다.

이런 경우, `GuardCheck`, `StateMachine` 패턴과 함께 사용하면 좋다.

> `private` 은 smart contract의 인터페이스로 비공개한다. 컨트랙트 내부에서만 사용한다. 상속 받은 컨트랙트에서도 사용 불가능하다.  
> `external`은 smart contract의 인터페이스로 공개한다. 컨트랙트 내부에서 호출할 경우 this를 사용해서 접근해야 한다.  
> `internal`은 smart contract의 인터페이스로 비공개한다. 컨트랙트 내부에서만 사용한다. 상속 받은 컨트랙트에서도 사용 가능하다.   
> `public`은 smart contract의 인터페이스로 공개한다. 컨트랙트의 내부와 외부에서 모두 호출할 수 있다. 컨트랙트 내부에서 호출할 경우 this를 사용해서 접근해야 한다.  

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract AccessRestriction {
    address public owner = msg.sender;
    uint public lastOwnerChange = now;

    modifier onlyBy(address _account) {
        require(msg.sender == _account);
        _;
    }

    modifier onlyAfter(uint _time) {
        require(now >= _time);
        _;
    }

    modifier costs(uint _amount) {
        require(msg.value >= _amount);
        _;
        if (msg.value > _amount) {
            msg.sender.transfer(msg.value - _amount);
        }
    }

    function changeOwner(address _newOwner) public onlyBy(owner) {
        owner = _newOwner;
    }

    function buyContract() public payable onlyAfter(lastOwnerChange + 4 weeks) costs(1 ether) {
        owner = msg.sender;
        lastOwnerChange = now;
    }
}
```

OpenZeppelin의 `Ownable`을 활용하면 더욱 간단하게 구현할 수 있다.






