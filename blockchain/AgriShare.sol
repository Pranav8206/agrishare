// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgriShare {
    struct Rental {
        uint256 equipmentId;
        bytes32 renterIdHash;
        bytes32 bookingIdHash;
        uint64 startTime;
        uint64 endTime;
        uint256 timestamp;
    }

    Rental[] public rentals;

    event RentalRecorded(
        uint256 indexed equipmentId,
        bytes32 indexed renterIdHash,
        bytes32 indexed bookingIdHash,
        uint64 startTime,
        uint64 endTime,
        uint256 timestamp,
        uint256 rentalIndex
    );

    function recordRental(
        uint256 _equipmentId,
        bytes32 _renterIdHash,
        bytes32 _bookingIdHash,
        uint64 _startTime,
        uint64 _endTime
    ) external {
        rentals.push(
            Rental({
                equipmentId: _equipmentId,
                renterIdHash: _renterIdHash,
                bookingIdHash: _bookingIdHash,
                startTime: _startTime,
                endTime: _endTime,
                timestamp: block.timestamp
            })
        );

        emit RentalRecorded(
            _equipmentId,
            _renterIdHash,
            _bookingIdHash,
            _startTime,
            _endTime,
            block.timestamp,
            rentals.length - 1
        );
    }

    function getRentalsCount() external view returns (uint256) {
        return rentals.length;
    }

    function getRental(uint256 index)
        external
        view
        returns (
            uint256 equipmentId,
            bytes32 renterIdHash,
            bytes32 bookingIdHash,
            uint64 startTime,
            uint64 endTime,
            uint256 timestamp
        )
    {
        Rental storage rental = rentals[index];
        return (
            rental.equipmentId,
            rental.renterIdHash,
            rental.bookingIdHash,
            rental.startTime,
            rental.endTime,
            rental.timestamp
        );
    }
}