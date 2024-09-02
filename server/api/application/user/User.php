<?php
class User {

    function __construct($db) {
        $this->db = $db;
    }

    public function getUser($token) {
        return $this->db->getUserByToken($token);
    }

    public function login($login, $password) {
        $user = $this->db->getUserByLogin($login, $password);
        if ($user) {
            $token = md5(rand());
            $this->db->updateToken($user->id, $token);
            return array(
                'id' => $user->id,
                'name' => $user->name,
                'token' => $token
            );
        }
        return null;
    }

    public function logout($token) {
        $user = $this->db->getUserByToken($token);
        if ($user) {
            $this->db->updateToken($user->id, null);
            return true;
        }
        return null;
    }

    public function registration($login, $password, $name) {
        $user = $this->db->getUserByLogin($login, $password);
        if ($user) {
            return null;
        }
        $this->db->registration($login, $password, $name);
        $user = $this->db->getUserByLogin($login, $password);
        if ($user) {
            $token = md5(rand());
            $this->db->updateToken($user->id, $token);
            return array(
                'id' => $user->id,
                'name' => $user->name,
                'token' => $token
            );
        }
        return null;
    }
}