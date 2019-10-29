import React, {Component} from 'react';
import { Text, View, ScrollView,Modal,Button, FlatList, StyleSheet, Alert, PanResponder } from 'react-native';
import { Card, Icon, Rating, Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites: state.favorites
    }
}

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId, rating, author, comment) => dispatch(postComment(dishId, rating, author, comment))
});


function RenderDish(props) {
    const dish = props.dish;

    handleViewRef = ref => this.view = ref;

    const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if ( dx < -200 )
            return true;
        else
            return false;
    }

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderGrant: () => {
            this.view.rubberBand(1000).then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));
        },

        onPanResponderEnd: (e, gestureState) => {
            console.log("pan responder end", gestureState);
            if (recognizeDrag(gestureState))
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + dish.name + ' to favorite?',
                    [
                    {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                    {text: 'OK', onPress: () => {props.favorite ? console.log('Already favorite') : props.onPressMakeFovourite()}},
                    ],
                    { cancelable: false }
                );
            return true;
        }
    })

    if(dish!= null) {
        return(
            <Animatable.View animation="fadeInDown" duration={2000} delay={1000} 
                ref={this.handleViewRef}
                {...panResponder.panHandlers}>
                <Card
                featuredTitle={dish.name}
                image={{uri: baseUrl + dish.image}}>                
                    <Text style={{margin: 10}}>
                        {dish.description}
                    </Text>
                    <View style={styles.icon} >
                        <Icon
                            raised
                            reverse
                            name={ props.favorite ? 'heart' : 'heart-o'}
                            type='font-awesome'
                            color='#f50'
                            onPress={() => props.favorite ? console.log('Already favorite') : props.onPressMakeFovourite()}
                            />
                        <Icon
                            raised
                            reverse
                            name='pencil'
                            type='font-awesome'
                            color='blue'
                            onPress={() => props.onPressComment()}
                            />
                    </View>
                    
                </Card>
            </Animatable.View>
               
        );
    } else {
        return(<View></View>);
    }

}
    

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'center',
        margin: 20
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'yellow',
        marginBottom: 20
    },
    modalText: {
        fontSize: 18,
        margin: 10
    },
    modalButton: {
        margin: 10
    },

    icon: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent:'center'
    }
});

function RenderComments(props) {
    const comments = props.comments;

    const renderCommentItem = ({ item, index}) => {
        return (
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Text style={{fontSize: 12}}>{item.rating} Stars</Text>
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    }

    return (
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}> 
            <Card title='Comments' >
            <FlatList 
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={item => item.id.toString()}
                />
            </Card>
        </Animatable.View>
        
    );
}

class DishDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            author: '',
            comment: '',
            rating: null,
            showModal: false,
            favorites: []
        };
    }

    toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }

    getComment(){
        this.toggleModal();
    }

    updateAuthor  = (author) =>{
        this.setState({author:author});
    }
    updateComment = (comment) => {
        this.setState({comment: comment});
    }
    updateRating = (rating) =>{
        this.setState({rating:rating});
    }

    postNewComment(dishId) {
        this.props.postComment(dishId, this.state.rating, this.state.author, this.state.comment);
        this.toggleModal(); 
        this.resetForm();
    }

    static navigationOptions = {
        title: 'Dish Details'
    };

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    resetForm(){
        this.setState({
            author: '',
            comment: '',
            rating: null
        });
    }

    render() {
        const dishId = this.props.navigation.getParam('dishId','');
        return(
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    onPressMakeFovourite={() => this.markFavorite(dishId)}
                    onPressComment={()=> this.toggleModal()} 
                    />
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />

                <Modal animationType = {"slide"} transparent = {false}
                        visible = {this.state.showModal}
                        onDismiss = {() => this.toggleModal() }
                        onRequestClose = {() => {this.toggleModal(); this.resetForm(); }}>
                        <View style = {styles.modal}>
                            <Rating
                                showRating
                                startingValue={0}
                                onFinishRating = {this.updateRating}
                                />                     
                            <Input
                                placeholder='Author'
                                onChangeText={this.updateAuthor}
                                leftIcon={{ type: 'font-awesome', name: 'user-o', margin:5 }}
                            />   
                            <Input
                                placeholder='Comment'
                                onChangeText={this.updateComment}
                                leftIcon={{ type: 'font-awesome', name: 'comment-o', margin:5 }}
                            />  
                            <View style={{margin:10}}>
                                <Button 
                                    onPress = {() =>{}}
                                    color="#512DA8"
                                    onPress={() => {
                                        this.postNewComment(dishId);
                                    }}
                                    title="SUBMIT" 
                                    />
                            </View>                      
                            <View style={{margin:10}}>
                                <Button
                                    onPress = {() =>{this.toggleModal()}}
                                    color="gray"
                                    title="CANCEL"
                                    onPress={()=> {
                                        this.toggleModal();
                                        this.resetForm();
                                    }} 
                                    />
                            </View>
                            
                        </View>
                    </Modal>
            </ScrollView>    
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DishDetail);