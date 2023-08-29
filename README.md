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

