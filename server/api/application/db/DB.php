<?php
class DB {
    function __construct() {
        $this->MOCK_USER = new stdClass();
        $this->MOCK_USER->id = 123;
        $this->MOCK_USER->name = 'Vasya Pupkin';
    }

    public function getUserByLogin($login, $password) {
        if ($login === 'vasya' && $password === '123') {
            return $this->MOCK_USER;
        }
    }

    public function getUserByToken($token) {
        return $this->MOCK_USER;
    }

    public function updateToken($id, $token) {

    }

    public function registration($login, $password, $name) {
        
    }
}