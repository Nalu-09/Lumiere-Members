
/**
 * Nalu-09 Menu API
 *
 * GitHub PagesからGASへ通信するための共通処理
 *
 * 会員向け：
 * - LINE IDトークンを送信
 * - 会員ランクに応じたメニューを取得
 *
 * 管理者向け：
 * - 管理者認証
 * - 全ブランドの料理を取得
 * - メニューを保存
 */

const NaluMenuAPI = (() => {
  "use strict";

  // =========================================
  // 1. GAS API接続先
  // =========================================

  const API_URL =
    "https://script.google.com/macros/s/AKfycbzuXAKRg9B5AuPOi2ppj9VuaN8qM01vzLlLnIBFjWiNnjKh7rxzmB_BEG2-U0qAMmM8/exec";

  // =========================================
  // 2. API通信
  // =========================================

  async function request(action, parameters = {}) {
    if (
      API_URL.includes("ここにデプロイID")
    ) {
      throw new Error(
        "GASのAPI URLが設定されていません"
      );
    }

    const body = new URLSearchParams();

    body.set("action", action);

    for (const [key, value] of Object.entries(
      parameters
    )) {
      if (
        value !== undefined &&
        value !== null
      ) {
        body.set(
          key,
          typeof value === "object"
            ? JSON.stringify(value)
            : String(value)
        );
      }
    }

    let response;

    try {
      response = await fetch(API_URL, {
        method: "POST",
        body,
        redirect: "follow"
      });
    } catch (error) {
      throw new Error(
        "サーバーに接続できませんでした。通信設定を確認してください。"
      );
    }

    if (!response.ok) {
      throw new Error(
        "サーバーエラー：" + response.status
      );
    }

    let data;

    try {
      data = await response.json();
    } catch (error) {
      throw new Error(
        "APIから正しいJSONを取得できませんでした"
      );
    }

    if (!data || data.ok !== true) {
      throw new Error(
        (data && data.message) ||
        "処理に失敗しました"
      );
    }

    return data;
  }

  // =========================================
  // 3. LINEログイン
  // =========================================

  async function getLineIdToken(liffId) {
    if (!liffId) {
      throw new Error(
        "LIFF IDが設定されていません"
      );
    }

    if (typeof liff === "undefined") {
      throw new Error(
        "LINE LIFF SDKを読み込めませんでした"
      );
    }

    await liff.init({
      liffId: liffId
    });

    if (!liff.isLoggedIn()) {
      liff.login();
      return null;
    }

    const idToken = liff.getIDToken();

    if (!idToken) {
      throw new Error(
        "LINEの認証情報を取得できませんでした"
      );
    }

    return idToken;
  }

  // =========================================
  // 4. 会員向けメニュー取得
  // =========================================

  async function getMemberMenu(idToken) {
    return request("getMemberMenu", {
      idToken
    });
  }

  // =========================================
  // 5. 管理画面データ取得
  // =========================================

  async function getAdminData(
    idToken,
    adminKey
  ) {
    return request("getMenuAdminData", {
      idToken,
      adminKey
    });
  }

  // =========================================
  // 6. メニュー保存
  // =========================================

  async function saveBrandMenu(
    idToken,
    adminKey,
    brandName,
    dishes
  ) {
    if (!Array.isArray(dishes)) {
      throw new Error(
        "料理データの形式が正しくありません"
      );
    }

    return request("saveBrandMenu", {
      idToken,
      adminKey,
      brandName,
      dishes
    });
  }

  // =========================================
  // 7. 公開メソッド
  // =========================================

  return Object.freeze({
    getLineIdToken,
    getMemberMenu,
    getAdminData,
    saveBrandMenu
  });

})();
