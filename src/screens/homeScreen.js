import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, SafeAreaView, Alert, StyleSheet, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getCoures } from '../functions/functions';
import styles from '../styles/style';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

// import Components
import AllDownload from '../components/allDownload';
import Loading from '../components/loading';

// import Icon
import HomeIcon from '../assets/images/icons/HomeIcon.svg';
import AdvertIcon from '../assets/images/icons/Vector.svg';

// import Ads
import { useRewardedAd } from '@react-native-admob/admob';
import BannerAds from '../components/bannerAds';
import * as subGradeActions from '../store/actions/subGrade';
import * as userActions from '../store/actions/user';
import { AdmobRewardId, adsWaitingTime } from '../utilities/functions';

dayjs.extend(utc)
const hookOptions = {
  loadOnMounted: false,
  loadOnDismissed: true,
  requestOptions: {
    requestNonPersonalizedAdsOnly: true,
  },
};

const homeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [couresData, setcouresData] = useState([]);
  const [newcouresData, setnewcouresData] = useState([]);
  const privilege = useSelector(state => state.user.userPrivilege)
  const [privilegeVisible, setprivilegeVisible] = useState(false);
  const { adLoadError, adLoaded, reward, show, load } = useRewardedAd(AdmobRewardId, hookOptions);
  const [adsTimeStamp, setadsTimeStamp] = useState();
  const [adsTime, setAdsTime] = useState(0);

  const GetCouresData = async () => {
    const res = await fetch(getCoures(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    res.json().then(res => setcouresData(res));
  };

  const getPrivilege = useCallback(() => {
    dispatch(userActions.getPrivilege());
  })

  const savePrivilege = async () => {
    const dateNow = dayjs.utc().local().format();
    await AsyncStorage.setItem('adsTime', dateNow.toString());
    dispatch(userActions.addPrivilege());
  };

  const checkOldAdsTime = async () => {
    try {
      const adsDateTime = await AsyncStorage.getItem('adsTime');
      setadsTimeStamp(adsDateTime)
    } catch (error) {
      console.log('Not have Ads Timestamp')
    }
  }

  const showRewardAds = () => {
    if (!adLoaded) {
      console.log('Ads loading')
      load()
    }
    setprivilegeVisible(true)
  }

  useEffect(() => {
    if (adLoadError) {
      console.error(adLoadError);
      Alert.alert(
        "แจ้งเตือน",
        "ไม่สามารถโหลดโฆษณาได้ในขณะนี้",
        [
          {
            text: "ตกลง",
            onPress: () => setprivilegeVisible(false),
          },
        ]
      )
    }
  }, [adLoadError]);

  useEffect(() => {
    if (reward) {
      console.log(`Reward Earned: ${reward.type}`);
      savePrivilege();
    }
  }, [reward]);

  useEffect(() => {
    checkOldAdsTime();
    getPrivilege();
  }, [privilege]);

  useEffect(() => {
    if (adsTimeStamp) {
      const timeNow = dayjs.utc().local().format();
      const findSecond = dayjs(timeNow) - dayjs(adsTimeStamp);
      const timeSec = findSecond / 1000;
      setAdsTime(timeSec)
    }
  }, [adsTimeStamp, privilegeVisible])

  useEffect(() => {
    GetCouresData();
  }, []);

  useEffect(() => {
    let test = [];
    let dontUse = [];
    let dataLength = couresData.length;
    for (let k = 0; k < dataLength; k++) {
      let value = couresData.splice(0, 1);
      if (value != '') {
        if (
          value[0].csubName == 'test' ||
          value[0].csubName == 'test1' ||
          value[0].csubName == 'test2' ||
          value[0].csubName == 'test3' ||
          value[0].csubName == 'Test' ||
          value[0].csubName == 'Test1' ||
          value[0].csubName == 'Test2' ||
          value[0].csubName == 'Test3'
        ) {
          dontUse.push(value[0]);
        } else {
          test.push(value[0]);
        }
      }
    } for (let k = 0; k < test.length; k++) {
      console.log('for test');
      couresData.push(test[k]);
    }
    for (let k = 0; k < dontUse.length; k++) {
      console.log('for dontUse');
      couresData.push(dontUse[k]);
    }
    setnewcouresData(test);
  }, [couresData]);

  const gradeHandler = async (couresSelected, couresName) => {
    let action;
    if (couresSelected !== 0) {
      action = subGradeActions.getSub(couresSelected, 38);
      try {
        await dispatch(action);
        navigation.navigate('type', { couresName: couresName });
      } catch (e) {
        Alert.alert('แจ้งเตือน', e.message);
      }
    } else {
      console.log(couresSelected);
    }
  };

  const AdvertModal = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View
          style={[
            styles.boxOvertime,
            { backgroundColor: '#1FA246', borderRadius: 15 },
          ]}>
          <Text style={[styles.textLight22, {
            marginTop: 10,
            textAlign: 'center',
            color: '#FFFFFF',
          }]}>
            ท่านมีสิทธื์ในการดูเฉลยจำนวน
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text
              style={[
                styles.textRegular30,
                {
                  textAlign: 'center',
                  textAlignVertical: 'center',
                  color: '#D7B641',
                  marginHorizontal: 5,
                },
              ]}>
              {privilege}
            </Text>
            <Text
              style={[
                styles.textLight22,
                {
                  textAlign: 'center',
                  textAlignVertical: 'center',
                  color: '#FFFFFF',
                  marginHorizontal: 5,
                },
              ]}>
              สิทธิ์
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              padding: 10,
              marginBottom: 5,
            }}>
            <TouchableOpacity
              style={{ alignItems: 'center' }}
              onPress={() => {
                setprivilegeVisible(false);
              }}>
              <Text style={[styles.textLight18, pageStyle.overTimeLeft]}>
                ยกเลิก
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={adsTime > adsWaitingTime || !adsTimeStamp ? false : true}
              style={{ alignItems: 'center' }}
              onPress={() => show()}>
              <Text style={[
                styles.textLight18,
                pageStyle.overTimeRight,
                adsTime > adsWaitingTime || !adsTimeStamp ? { backgroundColor: '#D7B641' } : { backgroundColor: '#999999', borderWidth: 0 }
              ]}>
                {
                  adsTime > adsWaitingTime || !adsTimeStamp ?
                    'ดูโฆษณาเพื่อรับสิทธิ์เพิ่ม'
                    : 'ดูโฆษณาได้ใน ' + (adsWaitingTime - adsTime) + ' วิ'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        style={{ flex: 1 }}
        source={require('../assets/images/Background-Class.png')}>
        <View
          style={{
            paddingHorizontal: 15,
            paddingBottom: 0,
            marginBottom: 10,
            flex: 1
          }}>
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, justifyContent: 'flex-start' }}>
              <ScrollView>
                <Text style={[styles.textMedium34, { textAlign: 'center', color: '#333333', marginTop: 15 }]}>
                  ประถมศึกษาปีที่ 5
                </Text>
                <View style={{ margin: 5, flex: 2 }}>
                  <View style={{ flex: 1 }}>
                    {newcouresData.map(item => {
                      return (
                        <TouchableOpacity
                          key={item.csubId}
                          onPress={() => gradeHandler(item.csubId, item.csubName)}
                          style={{ flex: 1, borderRadius: 8, margin: 5, height: 70 }}>
                          <ImageBackground
                            style={{ flex: 1.5, justifyContent: 'center' }}
                            source={require('../assets/images/bg-Artboard.png')}
                            resizeMode="stretch">
                            <Text style={[styles.textBold18, {
                              textAlign: 'center',
                              textAlignVertical: 'center',
                              color: '#fff',
                              fontWeight: '600',
                            }]}>
                              {item.csubName}
                            </Text>
                          </ImageBackground>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                </View>
                <Text style={[styles.textBold18, { flex: 0.4, textAlign: 'center', color: '#333333' }]}>
                  กลับมาหน้าหลักนี้โดยการกดรูปบ้าน {'\n'}
                  <HomeIcon width={26} height={26} /> ด้านบนขวาของแต่ละหน้า
                </Text>
                <AllDownload />
              </ScrollView>
              <TouchableOpacity
                style={{
                  margin: 10,
                  padding: 8,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  backgroundColor: '#37565b',
                  borderRadius: 10,
                }}
                onPress={() => showRewardAds()}>
                <AdvertIcon width={26} height={26} />
                <Text style={[styles.textLight18, { textAlignVertical: 'center', marginLeft: 10, color: '#ffffff' }]}>
                  ดูโฆษณาเพื่อรับสิทธิ์ดูเฉลย
                </Text>
              </TouchableOpacity>
              <Modal isVisible={privilegeVisible && adLoaded}>
                <AdvertModal />
              </Modal>
              <Loading isModalVisible={privilegeVisible && !adLoaded} />
            </View>
          </View>
        </View>
      </ImageBackground>
      <BannerAds />
    </SafeAreaView>
  );
};
const pageStyle = StyleSheet.create({
  overTimeLeft: {
    backgroundColor: '#fff',
    borderColor: '#D7B641',
    color: '#D7B641',
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    width: 100,
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  overTimeRight: {
    backgroundColor: '#D7B641',
    borderColor: '#FFffff',
    color: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    flex: 1,
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});
export default homeScreen;